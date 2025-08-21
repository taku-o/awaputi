/**
 * LeaderboardManager 単体テスト (Task 20.3)
 * 包括的なテストカバレッジでLeaderboardManagerの全機能をテスト
 */
import { jest  } from '@jest/globals';
import { LeaderboardManager  } from '../../../src/core/LeaderboardManager.js';
// Type definitions
interface MockLocalStorage {
    data: Record<string, string>;
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;
    clear: jest.Mock<void, []> }
interface MockStatisticsManager {
    recordEvent: jest.Mock<void, [string, any]>;
    updateScore: jest.Mock<void, [number]> }
interface MockGameEngine {
    statisticsManager: MockStatisticsManager,
    settings: {
        playerNam,e: string;
}
interface ScoreData {
    playerId: string;
    playerName?: string;
    score: number;
    stage?: string;
    timestamp?: number;
interface LeaderboardEntry extends ScoreData {
    timestamp: number;
interface GetLeaderboardOptions {
    limit?: number;
    period?: string;
    since?: number;
interface PaginationOptions {
    page: number,
    pageSize: number;
interface PaginatedResult {
    data: LeaderboardEntry[],
    currentPage: number;
    totalPages: number,
    totalItems: number;
    isLastPage: boolean;
interface PlayerRankResult {
    rank: number,
    totalPlayers: number;
    score?: number;
    found?: boolean;
interface ValidationResult {
    isValid: boolean,
    errors: string[];
    warnings?: string[];
interface MemoryUsage {
    leaderboards: number,
    cache: number;
interface Config {
    maxEntriesPerLeaderboard: number,
    storageKey: string;
    cacheTTL: number,
    dataVersion: string;
interface Backup {
    leaderboards: Record<string, LeaderboardEntry[]>;
    timestamp: number,
    version: string;
interface Stats {
    saveCount: number,
    validationErrors: number;
    cacheMisses: number,
    cacheHits: number;
// LocalStorage Mock
const mockLocalStorage: MockLocalStorage = {
    data: {},
    getItem: jest.fn((key: string) => mockLocalStorage.data[key] || null),
    setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage.data[key] = value)),
    removeItem: jest.fn((key: string) => {
        delete mockLocalStorage.data[key]),
    clear: jest.fn(() => {
        mockLocalStorage.data = {))') };'
Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,);
// GameEngine Mock
const mockGameEngine: MockGameEngine = {
    statisticsManager: {
        recordEvent: jest.fn( },
        updateScore: jest.fn()' },'
    settings: {
        playerName: 'TestPlayer'
    }
};
// Performance Mock
Object.defineProperty(global, 'performance', {
    value: {,
        now: jest.fn(() => Date.now()) };
    configurable: true,)');'
describe('LeaderboardManager', () => {
    let leaderboardManager: LeaderboardManager;
    beforeEach(() => {
        // LocalStorageをクリア
        mockLocalStorage.clear();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        leaderboardManager = new LeaderboardManager(mockGameEngine) }');'
    describe('初期化', (') => {'
        it('正常に初期化される', () => {
            expect(leaderboardManager).toBeInstanceOf(LeaderboardManager);
            expect(leaderboardManager.gameEngine).toBe(mockGameEngine) }');'
        it('設定が正しく初期化される', () => {
            expect(leaderboardManager.config).toBeDefined();
            expect(leaderboardManager.config.maxEntriesPerLeaderboard).toBe(100);
            expect(leaderboardManager.config.storageKey').toBe('awaputi_leaderboards') }');
        it('データ構造が初期化される', () => {
            expect(leaderboardManager.leaderboards).toBeInstanceOf(Map);
            expect(leaderboardManager.playerScores).toBeInstanceOf(Map);
            expect(leaderboardManager.cache).toBeInstanceOf(Map) }');'
        it('統計が初期化される', () => {
            expect(leaderboardManager.stats).toBeDefined();
            expect(leaderboardManager.stats.saveCount).toBe(0);
            expect(leaderboardManager.stats.validationErrors).toBe(0) }');'
    }
    describe('データ管理', (') => {'
        it('初期化時にデータを読み込む', async (') => {'
            const mockData = {
                leaderboards: {
                    overall: [
                        { playerId: 'player1', score: 10000, timestamp: Date.now(') }'
                    ]
                },
                version: '1.0.0'
            };
            
            mockLocalStorage.setItem('awaputi_leaderboards', JSON.stringify(mockData);
            await leaderboardManager.initialize(');'
            expect(leaderboardManager.leaderboards.has('overall').toBe(true);
        }');'
        it('データを保存する', async (') => {'
            leaderboardManager.leaderboards.set('test', [')'
                { playerId: 'player1', score: 5000, timestamp: Date.now() }
            ]);
            await leaderboardManager.save();
            expect(mockLocalStorage.setItem).toHaveBeenCalled(');'
            const savedData = JSON.parse(mockLocalStorage.getItem('awaputi_leaderboards')!);
            expect(savedData.leaderboards.test).toBeDefined();
        }');'
        it('無効なデータを処理する', async (') => {'
            mockLocalStorage.setItem('awaputi_leaderboards', 'invalid json');
            await leaderboardManager.initialize();
            // エラーが発生してもシステムは動作する
            expect(leaderboardManager.leaderboards.size).toBe(0) }');'
        it('データバージョンを管理する', async (') => {'
            const oldVersionData = {
                leaderboards: { overall: [] },
                version: '0.9.0'
            };
            
            mockLocalStorage.setItem('awaputi_leaderboards', JSON.stringify(oldVersionData);
            await leaderboardManager.initialize();
            // バージョン移行が実行される
            expect(leaderboardManager.leaderboards).toBeDefined();
        }');'
    }
    describe('スコア記録', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize() }');'
        it('新しいスコアを記録する', async (') => {'
            const scoreData: ScoreData = {
                playerId: 'player1',
                playerName: 'TestPlayer';
                score: 15000,
                stage: 'normal';
        timestamp: Date.now(' };'
            
            const result = await leaderboardManager.addScore('overall', scoreData);
            expect(result.success).toBe(true);
            expect(result.rank).toBeDefined();
            expect(result.isNewRecord).toBe(true);
        }');'
        it('複数のスコアを記録する', async (') => {'
            const scores: ScoreData[] = [
                { playerId: 'player1', playerName: 'Player1', score: 10000 };
                { playerId: 'player2', playerName: 'Player2', score: 15000 };
                { playerId: 'player3', playerName: 'Player3', score: 8000 }
            ];
            
            for (const score of scores') {'
                await leaderboardManager.addScore('overall', score') }'
            
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard.length).toBe(3);
            expect(leaderboard[0].score).toBe(15000); // 最高スコアが1位
        }');'
        it('ステージ別スコアを記録する', async (') => {'
            const normalScore: ScoreData = {
                playerId: 'player1',
                score: 10000;
                stage: 'normal'
            };
            
            const hardScore: ScoreData = {
                playerId: 'player1',
                score: 8000;
                stage: 'hard'
            };
            
            await leaderboardManager.addScore('stage_normal', normalScore');'
            await leaderboardManager.addScore('stage_hard', hardScore');'
            expect(leaderboardManager.getLeaderboard('stage_normal').length).toBe(1');'
            expect(leaderboardManager.getLeaderboard('stage_hard').length).toBe(1);
        }');'
        it('最大エントリ数制限を適用する', async () => {
            // 制限を小さく設定
            leaderboardManager.config.maxEntriesPerLeaderboard = 3,
            
            // 4つのスコアを追加
            for (let i = 0, i < 4, i++') {'
                await leaderboardManager.addScore('test', {
                    playerId: `player${i}`,
                    score: 1000 + i * 100,);
                   , timestamp: Date.now() + i
                }');'
            }
            
            const leaderboard = leaderboardManager.getLeaderboard('test');
            expect(leaderboard.length).toBe(3);
            expect(leaderboard[0].score).toBe(1300); // 最高スコア
        }');'
        it('同じプレイヤーの更新を処理する', async (') => {'
            // 初回スコア
            await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 10000 }');'
            // より高いスコア
            const result = await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 15000 };
            expect(result.isNewRecord).toBe(true);
            expect(result.previousBest).toBe(10000');'
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard.length).toBe(1);
            expect(leaderboard[0].score).toBe(15000);
        }');'
        it('低いスコアは記録しない', async (') => {'
            // 高いスコア
            await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 15000 }');'
            // より低いスコア
            const result = await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 10000 };
            expect(result.isNewRecord).toBe(false');'
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard[0].score).toBe(15000); // 高いスコアが維持される
        }');'
    }
    describe('ランキング取得', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize('),'
            // テストデータを追加
            const testScores: ScoreData[] = [
                { playerId: 'player1', playerName: 'Alice', score: 15000 };
                { playerId: 'player2', playerName: 'Bob', score: 12000 };
                { playerId: 'player3', playerName: 'Charlie', score: 18000 };
                { playerId: 'player4', playerName: 'David', score: 9000 };
                { playerId: 'player5', playerName: 'Eve', score: 14000 }
            ];
            
            for (const score of testScores') {'
                await leaderboardManager.addScore('overall', score) }
        }');'
        it('全体ランキングを取得する', (') => {'
            const leaderboard = leaderboardManager.getLeaderboard('overall');
            expect(leaderboard.length).toBe(5);
            expect(leaderboard[0].score).toBe(18000), // Charlie
            expect(leaderboard[1].score).toBe(15000), // Alice
            expect(leaderboard[4].score).toBe(9000),  // David
        }');'
        it('制限付きランキングを取得する', (') => {'
            const topThree = leaderboardManager.getLeaderboard('overall', { limit: 3 };
            expect(topThree.length).toBe(3);
            expect(topThree[0].score).toBe(18000);
            expect(topThree[2].score).toBe(15000);
        }');'
        it('期間別ランキングを取得する', () => {
            const now = Date.now('),'
            const dayAgo = now - 24 * 60 * 60 * 1000,
            
            const dailyRanking = leaderboardManager.getLeaderboard('overall', {
                period: 'daily',
                since: dayAgo,);
            expect(dailyRanking).toBeDefined();
        }');'
        it('プレイヤーの順位を取得する', (') => {'
            const rank = leaderboardManager.getPlayerRank('overall', 'player2');
            expect(rank.rank).toBe(3), // Bob (12000点) は3位
            expect(rank.totalPlayers).toBe(5);
            expect(rank.score).toBe(12000) }');'
        it('存在しないプレイヤーの順位', (') => {'
            const rank = leaderboardManager.getPlayerRank('overall', 'nonexistent');
            expect(rank.rank).toBe(-1);
            expect(rank.found).toBe(false) }');'
        it('周辺プレイヤーを取得する', (') => {'
            const surrounding = leaderboardManager.getSurroundingPlayers('overall', 'player2', 2);
            expect(surrounding.length).toBeLessThanOrEqual(5'), // player2の前後2人ずつ + player2'
            expect(surrounding.some(p => p.playerId === 'player2').toBe(true) }');'
    }
    describe('ページネーション機能', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize();
            // 大量のテストデータを追加
            for (let i = 0, i < 50, i++') {'
                await leaderboardManager.addScore('pagination_test', {
                    playerId: `player${i}`,
                    playerName: `Player${i}`;
                    score: 10000 - i * 100, // 降順でスコア設定);
                    timestamp: Date.now() + i
                }
            }
        }');'
        it('ページネーション付きでランキングを取得する', async (') => {'
            const page1 = await leaderboardManager.getLeaderboardPaginated('pagination_test', 'all', {
                page: 1,
                pageSize: 10 };
            expect(page1.data.length).toBe(10);
            expect(page1.currentPage).toBe(1);
            expect(page1.totalPages).toBe(5);
            expect(page1.totalItems).toBe(50);
            expect(page1.data[0].score).toBe(10000); // 最高スコア
        }');'
        it('複数ページにわたって取得する', async (') => {'
            const page2 = await leaderboardManager.getLeaderboardPaginated('pagination_test', 'all', {
                page: 2,
                pageSize: 10 };
            expect(page2.data.length).toBe(10);
            expect(page2.currentPage).toBe(2);
            expect(page2.data[0].score).toBe(9000); // 11位のスコア
        }');'
        it('最後のページを正しく処理する', async (') => {'
            const page5 = await leaderboardManager.getLeaderboardPaginated('pagination_test', 'all', {
                page: 5,
                pageSize: 10 };
            expect(page5.data.length).toBe(10);
            expect(page5.isLastPage).toBe(true);
        }');'
        it('範囲外のページ要求を処理する', async (') => {'
            const pageOutOfRange = await leaderboardManager.getLeaderboardPaginated('pagination_test', 'all', {
                page: 100,
                pageSize: 10 };
            expect(pageOutOfRange.data.length).toBe(0);
            expect(pageOutOfRange.currentPage).toBe(100);
        }');'
    }
    describe('キャッシュシステム', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize() }');'
        it('キャッシュからランキングを取得する', (') => {'
            // 初回取得（キャッシュミス）
            const leaderboard1 = leaderboardManager.getLeaderboard('overall');
            expect(leaderboardManager.stats.cacheMisses).toBe(1'),'
            // 2回目取得（キャッシュヒット）
            const leaderboard2 = leaderboardManager.getLeaderboard('overall');
            expect(leaderboardManager.stats.cacheHits).toBe(1);
            expect(leaderboard1).toEqual(leaderboard2) }');'
        it('キャッシュTTLを適用する', async (') => {'
            leaderboardManager.config.cacheTTL = 100, // 100ms
            
            leaderboardManager.getLeaderboard('overall');
            // TTL経過後
            await new Promise(resolve => setTimeout(resolve, 150)'),'
            leaderboardManager.getLeaderboard('overall');
            expect(leaderboardManager.stats.cacheMisses).toBe(2), // 期限切れで再取得
        }');'
        it('キャッシュサイズ制限を適用する', (') => {'
            leaderboardManager.maxCacheSize = 3,
            
            // 複数のリーダーボードでキャッシュを作成
            leaderboardManager.getLeaderboard('board1');
            leaderboardManager.getLeaderboard('board2');
            leaderboardManager.getLeaderboard('board3');
            leaderboardManager.getLeaderboard('board4'), // 制限を超える
            
            expect(leaderboardManager.cache.size).toBeLessThanOrEqual(3) }');'
        it('データ更新時にキャッシュをクリアする', async (') => {'
            leaderboardManager.getLeaderboard('overall'), // キャッシュ作成
            
            await leaderboardManager.addScore('overall', {
                playerId: 'newPlayer',
                score: 20000 }');'
            // キャッシュがクリアされて再計算される
            const updatedLeaderboard = leaderboardManager.getLeaderboard('overall');
            expect(updatedLeaderboard[0].score).toBe(20000);
        }');'
    }
    describe('データ検証', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize() }');'
        it('有効なスコアデータを検証する', (') => {'
            const validScore: ScoreData = {
                playerId: 'player1',
                playerName: 'TestPlayer';
                score: 15000,
                stage: 'normal';
        timestamp: Date.now( };
            
            const result = leaderboardManager.validateScoreData(validScore);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');'
        it('無効なスコアデータを検出する', (') => {'
            const invalidScore = {
                playerId: ', // 空のプレイヤーID'
                score: -100,  // 負のスコア
                stage: null   // 無効なステージ
            } as unknown as ScoreData;
            
            const result = leaderboardManager.validateScoreData(invalidScore);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        }');'
        it('スコア範囲を検証する', (') => {'
            const tooHighScore: ScoreData = {
                playerId: 'player1',
                score: 999999999, // 異常に高いスコア
                timestamp: Date.now( };
            
            const result = leaderboardManager.validateScoreData(tooHighScore);
            expect(result.warnings').toContain('SCORE_UNUSUALLY_HIGH');'
        }');'
        it('タイムスタンプを検証する', (') => {'
            const futureScore: ScoreData = {
                playerId: 'player1',
                score: 10000;
                timestamp: Date.now() + 24 * 60 * 60 * 1000 // 24時間後
            };
            
            const result = leaderboardManager.validateScoreData(futureScore);
            expect(result.warnings').toContain('TIMESTAMP_FUTURE');'
        }');'
    }
    describe('統計とパフォーマンス', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize() }');'
        it('パフォーマンス統計を記録する', async (') => {'
            const initialStats = { ...leaderboardManager.stats };
            
            await leaderboardManager.addScore('overall', {
                playerId: 'player1',
                score: 10000 };
            expect(leaderboardManager.stats.saveCount).toBe(initialStats.saveCount + 1);
        }');'
        it('メモリ使用量を監視する', () => {
            const memoryUsage = leaderboardManager.getMemoryUsage();
            expect(memoryUsage).toBeDefined();
            expect(memoryUsage.leaderboards).toBeDefined();
            expect(memoryUsage.cache).toBeDefined() }');'
        it('大量データのパフォーマンス', async () => {
            const startTime = performance.now();
            // 大量のスコアを追加
            for (let i = 0, i < 100, i++') {'
                await leaderboardManager.addScore('performance_test', {
                    playerId: `player${i}`;);
                    score: Math.random() * 100000,
                    timestamp: Date.now() + i
                }
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(5000'); // 5秒以内'
            
            const leaderboard = leaderboardManager.getLeaderboard('performance_test');
            expect(leaderboard.length).toBe(100);
        }');'
    }
    describe('期間別統計', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize();
            const now = Date.now('),'
            const testScores: ScoreData[] = [
                { playerId: 'player1', score: 10000, timestamp: now - 25 * 60 * 60 * 1000 }, // 25時間前
                { playerId: 'player2', score: 15000, timestamp: now - 12 * 60 * 60 * 1000 }, // 12時間前
                { playerId: 'player3', score: 8000, timestamp: now - 8 * 24 * 60 * 60 * 1000 }, // 8日前
                { playerId: 'player4', score: 12000, timestamp: now - 2 * 60 * 60 * 1000 }     // 2時間前
            ];
            
            for (const score of testScores') {'
                await leaderboardManager.addScore('period_test', score) }
        }');'
        it('日別ランキングを取得する', (') => {'
            const dailyRanking = leaderboardManager.getLeaderboardByPeriod('period_test', 'daily');
            // 24時間以内のスコアのみ
            expect(dailyRanking.length).toBe(2), // player2とplayer4
            expect(dailyRanking[0].score).toBe(15000), // player2が1位
        }');'
        it('週別ランキングを取得する', (') => {'
            const weeklyRanking = leaderboardManager.getLeaderboardByPeriod('period_test', 'weekly');
            // 7日以内のスコア
            expect(weeklyRanking.length).toBe(3), // player1, player2, player4
        }');'
        it('月別ランキングを取得する', (') => {'
            const monthlyRanking = leaderboardManager.getLeaderboardByPeriod('period_test', 'monthly');
            // 全スコア（30日以内）
            expect(monthlyRanking.length).toBe(4) }');'
        it('カスタム期間ランキングを取得する', () => {
            const customPeriod = Date.now(') - 20 * 60 * 60 * 1000, // 20時間前から'
            const customRanking = leaderboardManager.getLeaderboardByPeriod('period_test', 'custom', customPeriod);
            expect(customRanking.length).toBe(2), // player2とplayer4
        }');'
    }
    describe('エラーハンドリング', (') => {'
        it('存在しないリーダーボードを処理する', (') => {'
            const result = leaderboardManager.getLeaderboard('nonexistent');
            expect(result).toEqual([]) }');'
        it('LocalStorageエラーを處理する', async () => {
            mockLocalStorage.getItem.mockImplementation((') => {'
                throw new Error('LocalStorage error') };
            await leaderboardManager.initialize();
            // エラーが発生してもシステムは動作する
            expect(leaderboardManager.leaderboards).toBeDefined();
        }');'
        it('無効なJSONデータを処理する', async (') => {'
            mockLocalStorage.setItem('awaputi_leaderboards', '{ invalid json }');
            await leaderboardManager.initialize();
            expect(leaderboardManager.stats.validationErrors).toBeGreaterThan(0);
        }');'
        it('保存エラーを処理する', async () => {
            mockLocalStorage.setItem.mockImplementation((') => {'
                throw new Error('Storage quota exceeded') }');'
            await leaderboardManager.addScore('test', {
                playerId: 'player1',
                score: 10000 }');'
            // エラーが発生してもスコアは追加される（メモリ内）
            expect(leaderboardManager.getLeaderboard('test').length).toBe(1);
        }');'
    }
    describe('設定管理', (') => {'
        it('設定を更新する', () => {
            const newConfig: Partial<Config> = {
                maxEntriesPerLeaderboard: 50,
                cacheTTL: 10 * 60 * 1000 // 10分
            };
            
            leaderboardManager.updateConfig(newConfig);
            expect(leaderboardManager.config.maxEntriesPerLeaderboard).toBe(50);
            expect(leaderboardManager.config.cacheTTL).toBe(10 * 60 * 1000);
        }');'
        it('無効な設定を拒否する', () => {
            const invalidConfig = {
                maxEntriesPerLeaderboard: -10 // 無効な値
            };
            
            expect(() => {
                leaderboardManager.updateConfig(invalidConfig) }.toThrow();
        }
    }');'
    describe('バックアップと復元', () => {
        beforeEach(async () => {
            await leaderboardManager.initialize('),'
            // テストデータを追加
            await leaderboardManager.addScore('backup_test', {
                playerId: 'player1',
                score: 15000 }');'
        }
        it('データをバックアップする', () => {
            const backup = leaderboardManager.createBackup();
            expect(backup).toBeDefined();
            expect(backup.leaderboards).toBeDefined();
            expect(backup.timestamp).toBeDefined();
            expect(backup.version).toBe(leaderboardManager.config.dataVersion) }');'
        it('バックアップからデータを復元する', async () => {
            const backup = leaderboardManager.createBackup();
            // データを削除
            leaderboardManager.leaderboards.clear();
            // 復元
            await leaderboardManager.restoreFromBackup(backup'),'
            expect(leaderboardManager.getLeaderboard('backup_test').length).toBe(1'),'
            expect(leaderboardManager.getLeaderboard('backup_test')[0].score).toBe(15000) }');'
        it('無効なバックアップを拒否する', async (') => {'
            const invalidBackup = {
                leaderboards: null,
        version: '0.1.0'
            } as unknown as Backup;
            
            await expect(
                leaderboardManager.restoreFromBackup(invalidBackup);
            };
            ).rejects.toThrow();
        }');'
    }
    describe('クリーンアップ', (') => {'
        it('リソースをクリーンアップする', (') => {'
            // データを追加
            leaderboardManager.leaderboards.set('test', []'),'
            leaderboardManager.cache.set('test', { data: [], timestamp: Date.now() };
            leaderboardManager.cleanup();
            expect(leaderboardManager.leaderboards.size).toBe(0);
            expect(leaderboardManager.cache.size).toBe(0);
        }');'
        it('統計をリセットする', () => {
            leaderboardManager.stats.saveCount = 10,
            leaderboardManager.stats.cacheHits = 5,
            
            leaderboardManager.resetStats();
            expect(leaderboardManager.stats.saveCount).toBe(0);
            expect(leaderboardManager.stats.cacheHits).toBe(0) }
    }
};
// テストユーティリティ関数
function createMockScoreData(overrides: Partial<ScoreData> =) {}'): ScoreData {'
    return {
        playerId: 'testPlayer',
        playerName: 'Test Player';
        score: 10000,
        stage: 'normal';
        timestamp: Date.now(
        ...overrides
    }
}
function createMockLeaderboardData(count: number = 5): LeaderboardEntry[] {
    const data: LeaderboardEntry[] = [];
    for (let i = 0, i < count, i++) {
        data.push({
            playerId: `player${i}`,
            playerName: `Player ${i}`;
            score: 10000 - i * 1000,);
           , timestamp: Date.now() + i
        }');'
    }
    return data;
}