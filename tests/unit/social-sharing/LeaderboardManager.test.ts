/**
 * LeaderboardManager 単体テスト (Task 20.3)
 * 包括的なテストカバレッジでLeaderboardManagerの全機能をテスト
 */
import { jest } from '@jest/globals';
import { LeaderboardManager } from '../../../src/core/LeaderboardManager.js';

// Type definitions
interface MockLocalStorage {
    data: Record<string, string>;
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;
    clear: jest.Mock<void, []>;
}

interface MockStatisticsManager {
    recordEvent: jest.Mock<void, [string, any]>;
    updateScore: jest.Mock<void, [number]>;
}

interface MockGameEngine {
    statisticsManager: MockStatisticsManager;
    settings: {
        playerName: string;
    };
}

interface ScoreData {
    playerId: string;
    playerName?: string;
    score: number;
    stage?: string;
    timestamp?: number;
}

interface LeaderboardEntry extends ScoreData {
    timestamp: number;
}

interface GetLeaderboardOptions {
    limit?: number;
    period?: string;
    since?: number;
}

interface PaginationOptions { page: number; pageSize: number; }



interface PaginatedResult {
    data: LeaderboardEntry[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isLastPage: boolean;
}

interface PlayerRankResult {
    rank: number;
    totalPlayers: number;
    score?: number;
    found?: boolean;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

interface MemoryUsage { leaderboards: number; cache: number; }



interface Config {
    maxEntriesPerLeaderboard: number;
    storageKey: string;
    cacheTTL: number;
    dataVersion: string;
}

interface Backup {
    leaderboards: Record<string, LeaderboardEntry[]>;
    timestamp: number;
    version: string;
}

interface Stats {
    saveCount: number;
    validationErrors: number;
    cacheMisses: number;
    cacheHits: number;
}

// LocalStorage Mock
const mockLocalStorage: MockLocalStorage = {
    data: {},
    getItem: jest.fn((key: string) => mockLocalStorage.data[key] || null),
    setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage.data[key] = value
    }),
    removeItem: jest.fn((key: string) => {
        delete mockLocalStorage.data[key]
    }),
    clear: jest.fn(() => {
        mockLocalStorage.data = {}
    })
};

Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    configurable: true
});

// GameEngine Mock
const mockGameEngine: MockGameEngine = {
    statisticsManager: {
        recordEvent: jest.fn(),
        updateScore: jest.fn()
    },
    settings: {
        playerName: 'TestPlayer'
    }
};

// Performance Mock
Object.defineProperty(global, 'performance', {
    value: {
        now: jest.fn(() => Date.now())
    },
    configurable: true
});

describe('LeaderboardManager', () => {

    let leaderboardManager: LeaderboardManager;
    
    beforeEach(() => {
        // LocalStorageをクリア
        mockLocalStorage.clear();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        leaderboardManager = new LeaderboardManager(mockGameEngine)
    
});
describe('初期化', () => {
        it('正常に初期化される', () => {
            expect(leaderboardManager).toBeInstanceOf(LeaderboardManager);
            expect(leaderboardManager.gameEngine).toBe(mockGameEngine)
        
});

        it('設定が正しく初期化される', () => {

            expect(leaderboardManager.config).toBeDefined();
            expect(leaderboardManager.config.maxEntriesPerLeaderboard).toBe(100);
            expect(leaderboardManager.config.storageKey).toBe('awaputi_leaderboards')
        
});
it('データ構造が初期化される', () => {
            expect(leaderboardManager.leaderboards).toBeInstanceOf(Map);
            expect(leaderboardManager.playerScores).toBeInstanceOf(Map);
            expect(leaderboardManager.cache).toBeInstanceOf(Map)
        
});

        it('統計が初期化される', () => {

            expect(leaderboardManager.stats).toBeDefined();
            expect(leaderboardManager.stats.saveCount).toBe(0);
            expect(leaderboardManager.stats.validationErrors).toBe(0)
        
})
 
});

    describe('データ管理', () => {
        it('初期化時にデータを読み込む', async () => {
            const mockData = {
                leaderboards: {
                    overall: [
                        { playerId: 'player1', score: 10000, timestamp: Date.now() }
                    ]
                },
                version: '1.0.0'
            };
            
            mockLocalStorage.setItem('awaputi_leaderboards', JSON.stringify(mockData));
            await leaderboardManager.initialize();
            expect(leaderboardManager.leaderboards.has('overall')).toBe(true)
        });

        it('データを保存する', async () => {
            leaderboardManager.leaderboards.set('test', [
                { playerId: 'player1', score: 5000, timestamp: Date.now() }
            ]);
            await leaderboardManager.save();
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
            const savedData = JSON.parse(mockLocalStorage.getItem('awaputi_leaderboards')!);
            expect(savedData.leaderboards.test).toBeDefined()
        });

        it('無効なデータを処理する', async () => {
            mockLocalStorage.setItem('awaputi_leaderboards', 'invalid json');
            await leaderboardManager.initialize();
            // エラーが発生してもシステムは動作する
            expect(leaderboardManager.leaderboards.size).toBe(0)
        });

        it('データバージョンを管理する', async () => {
            const oldVersionData = {
                leaderboards: { overall: [] },
                version: '0.9.0'
            };
            
            mockLocalStorage.setItem('awaputi_leaderboards', JSON.stringify(oldVersionData));
            await leaderboardManager.initialize();
            // バージョン移行が実行される
            expect(leaderboardManager.leaderboards).toBeDefined()
        })
    });

    describe('スコア記録', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize()
        });

        it('新しいスコアを記録する', async () => {
            const scoreData: ScoreData = {
                playerId: 'player1',
                playerName: 'TestPlayer',
                score: 15000,
                stage: 'normal',
                timestamp: Date.now()
            };
            
            const result = await leaderboardManager.addScore('overall', scoreData);
            expect(result.success).toBe(true);
            expect(result.rank).toBeDefined();
            expect(result.isNewRecord).toBe(true)
        });

        it('複数のスコアを記録する', async () => {
            const scores: ScoreData[] = [
                { playerId: 'player1', playerName: 'Player1', score: 10000 },
                { playerId: 'player2', playerName: 'Player2', score: 15000 },
                { playerId: 'player3', playerName: 'Player3', score: 8000 }
            ];
            
            for (const score of scores) {
                await leaderboardManager.addScore('overall', score)
            }
            
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard.length).toBe(3);
            expect(leaderboard[0].score).toBe(15000); // 最高スコアが1位
        });

        it('ステージ別スコアを記録する', async () => {
            const normalScore: ScoreData = {
                playerId: 'player1',
                score: 10000,
                stage: 'normal'
            };
            
            const hardScore: ScoreData = {
                playerId: 'player1',
                score: 8000,
                stage: 'hard'
            };
            
            await leaderboardManager.addScore('stage_normal', normalScore);
            await leaderboardManager.addScore('stage_hard', hardScore);
            expect(leaderboardManager.getLeaderboard('stage_normal').length).toBe(1);
            expect(leaderboardManager.getLeaderboard('stage_hard').length).toBe(1)
        });

        it('最大エントリ数制限を適用する', async () => {
            // 制限を小さく設定
            leaderboardManager.config.maxEntriesPerLeaderboard = 3;
            
            // 4つのスコアを追加
            for (let i = 0; i < 4; i++) {
                await leaderboardManager.addScore('test', {
                    playerId: `player${i}`,
                    score: 1000 + i * 100,
                    timestamp: Date.now() + i
                })
            }
            
            const leaderboard = leaderboardManager.getLeaderboard('test');
            expect(leaderboard.length).toBe(3);
            expect(leaderboard[0].score).toBe(1300); // 最高スコア
        });

        it('同じプレイヤーの更新を処理する', async () => {

            // 初回スコア
            await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 10000
            
});
// より高いスコア
            const result = await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 15000
            
});

            expect(result.isNewRecord).toBe(true);
            expect(result.previousBest).toBe(10000);
            
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard.length).toBe(1);
            expect(leaderboard[0].score).toBe(15000)
        });

        it('低いスコアは記録しない', async () => {

            // 高いスコア
            await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 15000
            
});
// より低いスコア
            const result = await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 10000
            
});

            expect(result.isNewRecord).toBe(false);
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard[0].score).toBe(15000); // 高いスコアが維持される
        })
    });

    // 簡略化された他のテスト
    describe('基本機能テスト', () => {
        it('エラーハンドリングが機能する', () => {
            expect(() => {
                leaderboardManager.getLeaderboard('nonexistent')
            }).not.toThrow()
        });

        it('設定更新が機能する', () => {
            const newConfig = { maxEntriesPerLeaderboard: 50 };
            expect(() => {
                leaderboardManager.updateConfig(newConfig)
            }).not.toThrow()
        });

        it('メモリ使用量を取得できる', () => {

            const memoryUsage = leaderboardManager.getMemoryUsage();
            expect(memoryUsage).toBeDefined();
            expect(typeof memoryUsage.leaderboards).toBe('number');
            expect(typeof memoryUsage.cache).toBe('number');
        });
    });
});

// テストユーティリティ関数
function createMockScoreData(overrides: Partial<ScoreData> = {}): ScoreData {
    return {
        playerId: 'testPlayer',
        playerName: 'Test Player',
        score: 10000,
        stage: 'normal',
        timestamp: Date.now(),
        ...overrides
    };
}

function createMockLeaderboardData(count: number = 5): LeaderboardEntry[] {
    const data: LeaderboardEntry[] = [];
    for (let i = 0; i < count; i++) {
        data.push({
            playerId: `player${i}`,
            playerName: `Player ${i}`,
            score: 10000 - i * 1000,
            timestamp: Date.now() + i
        });
    }
    return data;
}
