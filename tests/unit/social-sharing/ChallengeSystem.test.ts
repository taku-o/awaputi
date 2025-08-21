/**
 * ChallengeSystem 単体テスト (Task 20.4)
 * 包括的なテストカバレッジでChallengeSystemの全機能をテスト
 */
import { jest  } from '@jest/globals';
import { ChallengeSystem  } from '../../../src/core/ChallengeSystem.js';
// Type definitions
interface MockLocalStorage {
    data: Record<string, string>;
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;
    clear: jest.Mock<void, []> }
interface MockPlayerData {
    addAP: jest.Mock<void, [number]> }
interface MockItemManager {
    addItem: jest.Mock<void, [string, number]> }
interface MockWeeklyChallengeManager {
    updateWeeklyProgress: jest.Mock<void, [any]> }
interface MockGameEngine {
    playerData: MockPlayerData,
    itemManager: MockItemManager;
    weeklyChallengeManager: MockWeeklyChallengeManager,
    on: jest.Mock<void, [string, Function]>;
    off: jest.Mock<void, [string, Function? ]>, : undefined
    emit: jest.Mock<void, [string, any]> }
interface ChallengeData {
    id?: string;
    type: string,
    title: string;
    description?: string;
    progressType: string,
    targetValue: number;
    reward: {
        typ,e: string },
        amount: number;
        itemId?: string;;
    endTime?: number;
    startTime?: number;
    isActive?: boolean;
    category?: string;
    difficulty?: string;
    metadata?: Record<string, any>;
}
interface GameData {
    score: number,
    duration: number;
    bubbleStats: {
        tota,l: number, };
    maxCombo: number;
    accuracy?: number;
}
interface Challenge {
    id: string,
    type: string;
    title: string;
    description?: string;
    progressType: string,
    targetValue: number;
    reward: {
        typ,e: string },
        amount: number;
        itemId?: string;;
    startTime?: number | null;
    endTime?: number | null;
    isActive: boolean;
    category?: string;
    difficulty?: string;
    metadata?: Record<string, any>;
}
interface ChallengeProgress {
    currentValue: number,
    completed: boolean;
    completionTime?: number;
    rewardClaimed?: boolean;
    rewardClaimTime?: number;
interface ChallengeWithProgress extends Challenge {
    progress: {
        current: number },
        target: number;
        percentage: number,
        completed: boolean;
    completionTime?: number;
}
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
    playerData: {
        addAP: jest.fn( },
    itemManager: {
        addItem: jest.fn( },
    weeklyChallengeManager: {
        updateWeeklyProgress: jest.fn( },
    on: jest.fn(
    off: jest.fn(
        emit: jest.fn()' };'
// ErrorHandler Mock
jest.mock('@/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => ({
        handleError: jest.fn(
        logError: jest.fn(
        handleRecovery: jest.fn(
        validateInput: jest.fn(() => true),
        setupFallback: jest.fn(
        initialize: jest.fn()
    )
))'),'
// Performance Mock
Object.defineProperty(global, 'performance', {
    value: {,
        now: jest.fn(() => Date.now()) };
    configurable: true,)');'
describe('ChallengeSystem', () => {
    let challengeSystem: ChallengeSystem;
    let mockGameEngineInstance: MockGameEngine;
    beforeEach(() => {
        // LocalStorageをクリア
        mockLocalStorage.clear();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        // GameEngineモックをリセット
        mockGameEngineInstance = {
            ...mockGameEngine,
            on: jest.fn(
            off: jest.fn(
        emit: jest.fn( };
        
        challengeSystem = new ChallengeSystem(mockGameEngineInstance);
    };
    afterEach(() => {
        if (challengeSystem) {
            challengeSystem.cleanup() }
    }');'
    describe('初期化', (') => {'
        it('正常に初期化される', () => {
            expect(challengeSystem).toBeInstanceOf(ChallengeSystem);
            expect(challengeSystem.gameEngine).toBe(mockGameEngineInstance) }');'
        it('設定が正しく初期化される', () => {
            expect(challengeSystem.config).toBeDefined();
            expect(challengeSystem.config.storageKey').toBe('awaputi_challenges'),'
            expect(challengeSystem.config.maxActiveChallenges).toBe(10);
            expect(challengeSystem.config.autoSaveInterval).toBe(30000) }');'
        it('データ構造が初期化される', () => {
            expect(challengeSystem.challenges).toBeInstanceOf(Map);
            expect(challengeSystem.playerProgress).toBeInstanceOf(Map);
            expect(challengeSystem.completedChallenges).toBeInstanceOf(Set) }');'
        it('チャレンジタイプ定数が定義される', () => {
            expect(challengeSystem.challengeTypes.DAILY').toBe('daily'),'
            expect(challengeSystem.challengeTypes.WEEKLY').toBe('weekly'),'
            expect(challengeSystem.challengeTypes.EVENT').toBe('event'),'
            expect(challengeSystem.challengeTypes.COMMUNITY').toBe('community') }');
        it('進捗タイプ定数が定義される', () => {
            expect(challengeSystem.progressTypes.SCORE').toBe('score'),'
            expect(challengeSystem.progressTypes.COMBO').toBe('combo'),'
            expect(challengeSystem.progressTypes.SCORE_CUMULATIVE').toBe('score_cumulative'),'
            expect(challengeSystem.progressTypes.CONSECUTIVE_DAYS').toBe('consecutive_days') }');
    }
    describe('システム初期化', (') => {'
        it('初期化プロセスが正常に実行される', async (') => {'
            const spy = jest.spyOn(challengeSystem, 'loadData').mockResolvedValue();
            await challengeSystem.initialize();
            expect(challengeSystem.isInitialized).toBe(true);
            expect(spy).toHaveBeenCalled();
            expect(mockGameEngineInstance.on).toHaveBeenCalled() }');'
        it('初期化時にデータを読み込む', async (') => {'
            const mockChallengeData = {
                version: '1.0.0',
                challenges: {
                    'test_challenge': {
                        id: 'test_challenge' },
                        type: 'daily';
                        title: 'テストチャレンジ'
                    }
                },
                progress: {
                    'test_challenge': {
                        currentValue: 5 },
                        completed: false;
                },
                completed: ['old_challenge'],
                stats: {
                    completedToday: 1
                }
            };
            
            mockLocalStorage.setItem('awaputi_challenges', JSON.stringify(mockChallengeData);
            await challengeSystem.loadData(');'
            expect(challengeSystem.challenges.has('test_challenge').toBe(true');'
            expect(challengeSystem.playerProgress.has('test_challenge').toBe(true');'
            expect(challengeSystem.completedChallenges.has('old_challenge').toBe(true);
        }');'
        it('イベントリスナーが設定される', async () => {
            await challengeSystem.initialize();
            expect(mockGameEngineInstance.on').toHaveBeenCalledWith('gameEnd', expect.any(Function),'
            expect(mockGameEngineInstance.on').toHaveBeenCalledWith('bubblePopped', expect.any(Function),'
            expect(mockGameEngineInstance.on').toHaveBeenCalledWith('itemUsed', expect.any(Function),'
            expect(mockGameEngineInstance.on').toHaveBeenCalledWith('achievementUnlocked', expect.any(Function),'
            expect(mockGameEngineInstance.on').toHaveBeenCalledWith('stageClear', expect.any(Function) }');
    }
    describe('チャレンジ作成', () => {
        beforeEach(async () => {
            await challengeSystem.initialize() }');'
        it('有効なチャレンジを作成する', (') => {'
            const challengeData: ChallengeData = {
                id: 'score_challenge',
                type: 'daily';
                title: 'スコアチャレンジ',
                description: '10000点を達成しよう';
                progressType: 'SCORE',
                targetValue: 10000;
                reward: { type: 'ap', amount: 100 }
            };
            
            const challenge = challengeSystem.createChallenge(challengeData);
            expect(challenge).toBeDefined();
            expect(challenge!.id').toBe('score_challenge');'
            expect(challenge!.type').toBe('daily');'
            expect(challenge!.targetValue).toBe(10000');'
            expect(challengeSystem.challenges.has('score_challenge').toBe(true');'
            expect(challengeSystem.playerProgress.has('score_challenge').toBe(true);
        }');'
        it('チャレンジIDが自動生成される', (') => {'
            const challengeData: ChallengeData = {
                type: 'daily',
                title: 'テストチャレンジ';
                progressType: 'PLAY_COUNT',
                targetValue: 5;
                reward: { type: 'ap', amount: 50 }
            };
            
            const challenge = challengeSystem.createChallenge(challengeData);
            expect(challenge!.id).toMatch(/^challenge_\d+_[a-z0-9]+$/);
        }');'
        it('無効なチャレンジデータを拒否する', (') => {'
            const invalidChallengeData = {
                type: 'daily';
                // titleがない
                progressType: 'SCORE',
                targetValue: -100, // 負の値
                reward: { type: 'ap', amount: 50 }
            } as ChallengeData;
            
            const challenge = challengeSystem.createChallenge(invalidChallengeData);
            expect(challenge).toBeNull();
        }');'
        it('デフォルト値が適用される', (') => {'
            const challengeData: ChallengeData = {
                type: 'daily',
                title: 'シンプルチャレンジ';
                progressType: 'BUBBLE_POP',
                targetValue: 100;
                reward: { type: 'ap', amount: 25 }
            };
            
            const challenge = challengeSystem.createChallenge(challengeData);
            expect(challenge!.isActive).toBe(true);
            expect(challenge!.category').toBe('general');'
            expect(challenge!.difficulty').toBe('normal');'
            expect(challenge!.metadata).toEqual({) }
    }');'
    describe('進捗更新機能', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            // テストチャレンジを作成
            challengeSystem.createChallenge({
                id: 'score_test',
                type: 'daily';
                title: 'スコアテスト',
                progressType: 'SCORE';
                targetValue: 5000,
                reward: { type: 'ap', amount: 100 }
            }');'
            challengeSystem.createChallenge({
                id: 'cumulative_test',
                type: 'weekly';
                title: '累積テスト',
                progressType: 'SCORE_CUMULATIVE';
                targetValue: 20000,
                reward: { type: 'ap', amount: 200 }');'
        }
        it('基本的な進捗更新', (') => {'
            challengeSystem.updateProgress('SCORE', 3000'),'
            const progress = challengeSystem.playerProgress.get('score_test');
            expect(progress!.currentValue).toBe(3000);
            expect(progress!.completed).toBe(false) }');'
        it('累積進捗の更新', (') => {'
            challengeSystem.updateProgress('SCORE_CUMULATIVE', 8000'),'
            challengeSystem.updateProgress('SCORE_CUMULATIVE', 7000'),'
            const progress = challengeSystem.playerProgress.get('cumulative_test');
            expect(progress!.currentValue).toBe(15000) }');'
        it('ベスト記録の更新', (') => {'
            challengeSystem.updateProgress('SCORE', 3000'),'
            challengeSystem.updateProgress('SCORE', 2000'), // より低いスコア'
            challengeSystem.updateProgress('SCORE', 4000'), // より高いスコア'
            
            const progress = challengeSystem.playerProgress.get('score_test');
            expect(progress!.currentValue).toBe(4000), // 最高値が保持される
        }');'
        it('チャレンジ完了を検出する', (') => {'
            challengeSystem.updateProgress('SCORE', 6000'), // 目標値5000を超過'
            
            const progress = challengeSystem.playerProgress.get('score_test');
            expect(progress!.completed).toBe(true'),'
            expect(challengeSystem.completedChallenges.has('score_test').toBe(true) }');'
        it('進捗イベントが発火される', (') => {'
            challengeSystem.updateProgress('SCORE', 3000);
            expect(mockGameEngineInstance.emit').toHaveBeenCalledWith('challengeProgress', expect.objectContaining({'
                challengeId: 'score_test',
                progressType: 'SCORE';
                oldValue: 0,
                newValue: 3000;
                targetValue: 5000 }');'
        }
        it('特定のチャレンジの進捗を更新する', (') => {'
            challengeSystem.updateProgress('SCORE', 2500, 'score_test');
            const progress = challengeSystem.playerProgress.get('score_test');
            expect(progress!.currentValue).toBe(2500) }');'
    }
    describe('チャレンジ完了処理', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            challengeSystem.createChallenge({
                id: 'completion_test',
                type: 'daily';
                title: '完了テスト',
                progressType: 'PLAY_COUNT';
                targetValue: 3,
                reward: { type: 'ap', amount: 75 }
            }');'
        }
        it('チャレンジが正常に完了する', (') => {'
            const result = challengeSystem.completeChallenge('completion_test');
            expect(result).toBe(true'),'
            const progress = challengeSystem.playerProgress.get('completion_test');
            expect(progress!.completed).toBe(true);
            expect(progress!.completionTime).toBeDefined('),'
            expect(challengeSystem.completedChallenges.has('completion_test').toBe(true) }');'
        it('完了イベントが発火される', (') => {'
            challengeSystem.completeChallenge('completion_test');
            expect(mockGameEngineInstance.emit').toHaveBeenCalledWith('challengeCompleted', expect.objectContaining({'
                challengeId: 'completion_test');
               , challenge: expect.any(Object,
                progress: expect.any(Object','
                reward: { type: 'ap', amount: 75 }
            }');'
        }
        it('既に完了したチャレンジは再完了しない', (') => {'
            challengeSystem.completeChallenge('completion_test');
            const result = challengeSystem.completeChallenge('completion_test');
            expect(result).toBe(false) }');'
        it('存在しないチャレンジの完了を試行する', (') => {'
            const result = challengeSystem.completeChallenge('nonexistent');
            expect(result).toBe(false) }');'
    }
    describe('報酬システム', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            challengeSystem.createChallenge({
                id: 'reward_test',
                type: 'daily';
                title: '報酬テスト',
                progressType: 'COMBO';
                targetValue: 10,
                reward: { type: 'ap', amount: 150 }
            }');'
            // チャレンジを完了状態にする
            challengeSystem.completeChallenge('reward_test');
        }');'
        it('AP報酬を正常に付与する', (') => {'
            const result = challengeSystem.claimReward('reward_test');
            expect(result).toBe(true);
            expect(mockGameEngineInstance.playerData.addAP).toHaveBeenCalledWith(150'),'
            const progress = challengeSystem.playerProgress.get('reward_test');
            expect(progress!.rewardClaimed).toBe(true);
            expect(progress!.rewardClaimTime).toBeDefined() }');'
        it('アイテム報酬を付与する', (') => {'
            // アイテム報酬のチャレンジを作成
            challengeSystem.createChallenge({
                id: 'item_reward_test',
                type: 'daily';
                title: 'アイテム報酬テスト',
                progressType: 'TIME_PLAYED';
                targetValue: 300000, // 5分
                reward: { type: 'item', itemId: 'time_bonus', amount: 3 }
            }');'
            challengeSystem.completeChallenge('item_reward_test');
            const result = challengeSystem.claimReward('item_reward_test');
            expect(result).toBe(true);
            expect(mockGameEngineInstance.itemManager.addItem').toHaveBeenCalledWith('time_bonus', 3);'
        }');'
        it('報酬受け取りイベントが発火される', (') => {'
            challengeSystem.claimReward('reward_test');
            expect(mockGameEngineInstance.emit').toHaveBeenCalledWith('challengeRewardClaimed', expect.objectContaining({'
                challengeId: 'reward_test');
               , challenge: expect.any(Object','
                reward: { type: 'ap', amount: 150 }
            }');'
        }
        it('未完了チャレンジの報酬は受け取れない', (') => {'
            challengeSystem.createChallenge({
                id: 'incomplete_test',
                type: 'daily';
                title: '未完了テスト',
                progressType: 'SCORE';
                targetValue: 10000,
                reward: { type: 'ap', amount: 100 }
            }');'
            const result = challengeSystem.claimReward('incomplete_test');
            expect(result).toBe(false);
            expect(mockGameEngineInstance.playerData.addAP).not.toHaveBeenCalled();
        }');'
        it('既に受け取った報酬は再度受け取れない', (') => {'
            challengeSystem.claimReward('reward_test');
            mockGameEngineInstance.playerData.addAP.mockClear('),'
            const result = challengeSystem.claimReward('reward_test');
            expect(result).toBe(false);
            expect(mockGameEngineInstance.playerData.addAP).not.toHaveBeenCalled() }');'
    }
    describe('チャレンジ取得機能', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            // 複数のテストチャレンジを作成
            challengeSystem.createChallenge({
                id: 'active_test',
                type: 'daily';
                title: 'アクティブテスト',
                progressType: 'BUBBLE_POP';
                targetValue: 50,
                reward: { type: 'ap', amount: 60 }
            }');'
            challengeSystem.createChallenge({
                id: 'expired_test',
                type: 'daily';
                title: '期限切れテスト',
                progressType: 'STAGE_CLEAR';
                targetValue: 2','
                reward: { type: 'ap', amount: 40 ,
                endTime: Date.now() - 10000 // 10秒前に期限切れ
            }');'
            challengeSystem.createChallenge({
                id: 'completed_test',
                type: 'weekly';
                title: '完了テスト',
                progressType: 'ACHIEVEMENT';
                targetValue: 1,
                reward: { type: 'ap', amount: 200 }');'
            // 1つを完了状態にする
            challengeSystem.completeChallenge('completed_test');
            // 進捗を設定
            challengeSystem.updateProgress('BUBBLE_POP', 30);
        }');'
        it('アクティブなチャレンジを取得する', () => {
            const activeChallenges = challengeSystem.getActiveChallenges();
            expect(activeChallenges).toHaveLength(2'), // active_test と completed_test'
            expect(activeChallenges.find(c => c.id === 'active_test').toBeDefined('),'
            expect(activeChallenges.find(c => c.id === 'expired_test').toBeUndefined() }');'
        it('進捗情報が含まれる', () => {
            const activeChallenges = challengeSystem.getActiveChallenges('),'
            const activeChallenge = activeChallenges.find(c => c.id === 'active_test');
            expect(activeChallenge!.progress).toBeDefined();
            expect(activeChallenge!.progress.current).toBe(30);
            expect(activeChallenge!.progress.target).toBe(50);
            expect(activeChallenge!.progress.percentage).toBe(60);
            expect(activeChallenge!.progress.completed).toBe(false) }');'
        it('完了したチャレンジを取得する', () => {
            const completedChallenges = challengeSystem.getCompletedChallenges();
            expect(completedChallenges).toHaveLength(1);
            expect(completedChallenges[0].id').toBe('completed_test'),'
            expect(completedChallenges[0].completionTime).toBeDefined() }');'
    }
    describe('チャレンジの有効性チェック', (') => {'
        it('開始時刻前のチャレンジは無効', (') => {'
            const challenge: Challenge = {
                id: 'test',
                type: 'daily';
                title: 'Test',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 50 },
                startTime: Date.now() + 10000, // 10秒後開始
                endTime: Date.now() + 60000,   // 1分後終了
                isActive: true;
            
            expect(challengeSystem.isChallengeActive(challenge).toBe(false);
        }');'
        it('終了時刻後のチャレンジは無効', (') => {'
            const challenge: Challenge = {
                id: 'test',
                type: 'daily';
                title: 'Test',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 50 },
                startTime: Date.now() - 60000, // 1分前開始
                endTime: Date.now() - 10000,   // 10秒前終了
                isActive: true;
            
            expect(challengeSystem.isChallengeActive(challenge).toBe(false);
        }');'
        it('非アクティブのチャレンジは無効', (') => {'
            const challenge: Challenge = {
                id: 'test',
                type: 'daily';
                title: 'Test',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 50 },
                startTime: Date.now() - 10000, // 10秒前開始
                endTime: Date.now() + 60000,   // 1分後終了
                isActive: false;
            
            expect(challengeSystem.isChallengeActive(challenge).toBe(false);
        }');'
        it('条件を満たすチャレンジは有効', (') => {'
            const challenge: Challenge = {
                id: 'test',
                type: 'daily';
                title: 'Test',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 50 },
                startTime: Date.now() - 10000, // 10秒前開始
                endTime: Date.now() + 60000,   // 1分後終了
                isActive: true;
            
            expect(challengeSystem.isChallengeActive(challenge).toBe(true);
        }');'
        it('終了時刻が設定されていないチャレンジは有効', (') => {'
            const challenge: Challenge = {
                id: 'test',
                type: 'daily';
                title: 'Test',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 50 },
                startTime: Date.now() - 10000, // 10秒前開始
                endTime: null,
                isActive: true;
            
            expect(challengeSystem.isChallengeActive(challenge).toBe(true);
        }');'
    }
    describe('統計機能', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            // 複数タイプのチャレンジを作成
            challengeSystem.createChallenge({
                id: 'daily_1',
                type: 'daily';
                title: 'デイリー1',
                progressType: 'SCORE';
                targetValue: 5000,
                reward: { type: 'ap', amount: 50 }
            }');'
            challengeSystem.createChallenge({
                id: 'daily_2',
                type: 'daily';
                title: 'デイリー2',
                progressType: 'PLAY_COUNT';
                targetValue: 3,
                reward: { type: 'ap', amount: 30 }');'
            challengeSystem.createChallenge({
                id: 'weekly_1',
                type: 'weekly';
                title: 'ウィークリー1',
                progressType: 'BUBBLE_POP_CUMULATIVE';
                targetValue: 500,
                reward: { type: 'ap', amount: 100 }');'
            // 1つを完了状態にする
            challengeSystem.completeChallenge('daily_2');
        }');'
        it('チャレンジ統計を取得する', () => {
            const stats = challengeSystem.getChallengeStats();
            expect(stats.totalChallenges).toBe(3);
            expect(stats.activeChallenges).toBe(3);
            expect(stats.completedChallenges).toBe(1);
            expect(stats.byType.daily.total).toBe(2);
            expect(stats.byType.daily.completed).toBe(1);
            expect(stats.byType.weekly.total).toBe(1) }');'
        it('統計が更新される', () => {
            challengeSystem.updateStats();
            expect(challengeSystem.stats.activeChallenges).toBe(3);
            expect(challengeSystem.stats.lastUpdateTime).toBeGreaterThan(0) }');'
    }
    describe('日次リセット機能', (') => {'
        it('日次リセットが必要かチェックする', () => {
            // 昨日の日付を設定
            const yesterday = Date.now(') - 24 * 60 * 60 * 1000,'
            mockLocalStorage.setItem('awaputi_challenges_last_reset', yesterday.toString()'),'
            const spy = jest.spyOn(challengeSystem, 'performDailyReset');
            challengeSystem.checkDailyReset();
            expect(spy).toHaveBeenCalled() }');'
        it('日次リセットが実行される', async () => {
            await challengeSystem.initialize('),'
            // 期限切れのデイリーチャレンジを作成
            challengeSystem.createChallenge({
                id: 'expired_daily',
                type: 'daily';
                title: '期限切れデイリー',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 25 },
                endTime: Date.now() - 10000 // 10秒前に期限切れ
            };
            challengeSystem.performDailyReset(');'
            expect(challengeSystem.challenges.has('expired_daily').toBe(false);
            expect(challengeSystem.stats.completedToday).toBe(0);
        }');'
        it('今日既にリセット済みの場合は再実行しない', () => {
            // 今日の日付を設定
            const today = Date.now('),'
            mockLocalStorage.setItem('awaputi_challenges_last_reset', today.toString()'),'
            const spy = jest.spyOn(challengeSystem, 'performDailyReset');
            challengeSystem.checkDailyReset();
            expect(spy).not.toHaveBeenCalled() }');'
    }
    describe('データ永続化', () => {
        beforeEach(async () => {
            await challengeSystem.initialize() }');'
        it('データを保存する', async (') => {'
            challengeSystem.createChallenge({
                id: 'save_test',
                type: 'daily';
                title: '保存テスト',
                progressType: 'COMBO';
                targetValue: 15,
                reward: { type: 'ap', amount: 80 }
            };
            await challengeSystem.saveData();
            expect(mockLocalStorage.setItem').toHaveBeenCalledWith('
                'awaputi_challenges');
                expect.stringContaining('save_test');
        }');'
        it('データを読み込む', async (') => {'
            const testData = {
                version: '1.0.0',
                challenges: {
                    'load_test': {
                        id: 'load_test' },
                        type: 'weekly';
                        title: '読み込みテスト',
                        progressType: 'TIME_PLAYED';
                        targetValue: 600000
                    }
                },
                progress: {
                    'load_test': {
                        currentValue: 120000 },
                        completed: false;
                },
                completed: [],
                stats: { completedToday: 2 }
            };
            
            mockLocalStorage.setItem('awaputi_challenges', JSON.stringify(testData);
            await challengeSystem.loadData(');'
            expect(challengeSystem.challenges.has('load_test').toBe(true');'
            expect(challengeSystem.playerProgress.get('load_test')!.currentValue).toBe(120000);
        }');'
        it('破損したデータを処理する', async (') => {'
            mockLocalStorage.setItem('awaputi_challenges', 'invalid json data');
            await challengeSystem.loadData();
            // エラーが発生してもシステムは動作する
            expect(challengeSystem.challenges.size).toBe(0);
            expect(challengeSystem.playerProgress.size).toBe(0) }');'
    }
    describe('自動保存機能', () => {
        beforeEach(async () => {
            await challengeSystem.initialize() }');'
        it('自動保存タイマーが開始される', () => {
            challengeSystem.startAutoSave();
            expect(challengeSystem.autoSaveTimer).toBeDefined() }');'
        it('自動保存タイマーが停止される', () => {
            challengeSystem.startAutoSave();
            challengeSystem.stopAutoSave();
            expect(challengeSystem.autoSaveTimer).toBeNull() }');'
        it('重複する自動保存タイマーを防ぐ', () => {
            challengeSystem.startAutoSave();
            const firstTimer = challengeSystem.autoSaveTimer,
            
            challengeSystem.startAutoSave();
            const secondTimer = challengeSystem.autoSaveTimer,
            
            expect(firstTimer).not.toBe(secondTimer) }');'
    }
    describe('ゲームイベント統合', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            challengeSystem.createChallenge({
                id: 'game_event_test',
                type: 'daily';
                title: 'ゲームイベントテスト',
                progressType: 'SCORE';
                targetValue: 8000,
                reward: { type: 'ap', amount: 120 }
            }');'
        }
        it('gameEnd イベントで進捗が更新される', (') => {'
            const gameData: GameData = {
                score: 7500,
                duration: 240000, // 4分
                bubbleStats: { total: 150 },
                maxCombo: 12
            };
            
            // gameEndイベントハンドラーを直接呼び出し
            const gameEndHandler = mockGameEngineInstance.on.mock.calls
                .find(call => call[0] === 'gameEnd')? .[1];
            
            if (gameEndHandler) {
                gameEndHandler(gameData'),'
                const progress = challengeSystem.playerProgress.get('game_event_test');
                expect(progress!.currentValue).toBe(7500) }
        }');'
        it('bubblePopped イベントで泡ポップ数が更新される', (') => {'
            challengeSystem.createChallenge({ : undefined
                id: 'bubble_test',
                type: 'daily';
                title: '泡ポップテスト',
                progressType: 'BUBBLE_POP';
                targetValue: 100,
                reward: { type: 'ap', amount: 50 }
            }');'
            const bubblePoppedHandler = mockGameEngineInstance.on.mock.calls
                .find(call => call[0] === 'bubblePopped')? .[1];
            
            if (bubblePoppedHandler') { : undefined'
                bubblePoppedHandler({ type: 'normal' )','
                const progress = challengeSystem.playerProgress.get('bubble_test');
                expect(progress!.currentValue).toBe(1) }
        }');'
    }
    describe('チャレンジID生成', (') => {'
        it('一意のIDが生成される', () => {
            const id1 = challengeSystem.generateChallengeId();
            const id2 = challengeSystem.generateChallengeId();
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^challenge_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^challenge_\d+_[a-z0-9]+$/) }');'
    }
    describe('データ検証', (') => {'
        it('有効なチャレンジデータを承認する', (') => {'
            const validChallenge: ChallengeData = {
                id: 'valid_test',
                type: 'daily';
                title: '有効なテスト',
                progressType: 'SCORE';
                targetValue: 5000,
                reward: { type: 'ap', amount: 100 }
            };
            
            expect(challengeSystem.validateChallengeData(validChallenge).toBe(true);
        }');'
        it('無効なチャレンジデータを拒否する', (') => {'
            const invalidChallenges: Partial<ChallengeData>[] = [
                // IDがない
                {
                    type: 'daily',
                    title: 'テスト';
                    progressType: 'SCORE',
                    targetValue: 1000;
                    reward: { type: 'ap', amount: 50 }
                },
                // progressTypeが無効
                {
                    id: 'test',
                    type: 'daily';
                    title: 'テスト',
                    progressType: 'INVALID_TYPE';
                    targetValue: 1000,
                    reward: { type: 'ap', amount: 50 }
                },
                // targetValueが負
                {
                    id: 'test',
                    type: 'daily';
                    title: 'テスト',
                    progressType: 'SCORE';
                    targetValue: -100,
                    reward: { type: 'ap', amount: 50 }
                },
                // rewardがない
                {
                    id: 'test',
                    type: 'daily';
                    title: 'テスト',
                    progressType: 'SCORE';
                    targetValue: 1000
                }
            ];
            
            invalidChallenges.forEach(challenge => {);
                expect(challengeSystem.validateChallengeData(challenge as ChallengeData).toBe(false) }
        }
    }');'
    describe('システムクリーンアップ', () => {
        beforeEach(async () => {
            await challengeSystem.initialize() }');'
        it('クリーンアップが正常に実行される', () => {
            challengeSystem.startAutoSave('),'
            const saveDataSpy = jest.spyOn(challengeSystem, 'saveData').mockResolvedValue();
            challengeSystem.cleanup();
            expect(challengeSystem.autoSaveTimer).toBeNull();
            expect(saveDataSpy).toHaveBeenCalled();
            expect(mockGameEngineInstance.off).toHaveBeenCalled() }');'
    }
    describe('リセット機能', () => {
        beforeEach(async () => {
            await challengeSystem.initialize('),'
            challengeSystem.createChallenge({
                id: 'reset_test',
                type: 'daily';
                title: 'リセットテスト',
                progressType: 'PLAY_COUNT';
                targetValue: 5,
                reward: { type: 'ap', amount: 75 }
            }');'
        }
        it('システムがリセットされる', async (') => {'
            const saveDataSpy = jest.spyOn(challengeSystem, 'saveData').mockResolvedValue();
            await challengeSystem.reset();
            expect(challengeSystem.challenges.size).toBe(0);
            expect(challengeSystem.playerProgress.size).toBe(0);
            expect(challengeSystem.completedChallenges.size).toBe(0);
            expect(challengeSystem.stats.completedToday).toBe(0);
            expect(saveDataSpy).toHaveBeenCalled() }');'
    }
    describe('エラーハンドリング', (') => {'
        it('チャレンジ作成エラーを処理する', (') => {'
            // validateChallengeDataをモックしてエラーを発生させる
            jest.spyOn(challengeSystem, 'validateChallengeData').mockImplementation((') => {'
                throw new Error('Validation error') }');'
            const result = challengeSystem.createChallenge({
                id: 'error_test',
                type: 'daily';
                title: 'エラーテスト',
                progressType: 'SCORE';
                targetValue: 1000,
                reward: { type: 'ap', amount: 50 }
            };
            expect(result).toBeNull();
        }');'
        it('データ保存エラーを処理する', async () => {
            mockLocalStorage.setItem.mockImplementation((') => {'
                throw new Error('Storage error') };
            // エラーが発生してもクラッシュしない
            await expect(challengeSystem.saveData().resolves.not.toThrow();
        }');'
        it('データ読み込みエラーを処理する', async () => {
            mockLocalStorage.getItem.mockImplementation((') => {'
                throw new Error('Storage error') };
            // エラーが発生してもシステムは初期化される
            await challengeSystem.loadData();
            expect(challengeSystem.challenges).toBeInstanceOf(Map);
            expect(challengeSystem.playerProgress).toBeInstanceOf(Map);
            expect(challengeSystem.completedChallenges).toBeInstanceOf(Set);
        }');'
    }
    describe('パフォーマンス', (') => {'
        it('大量のチャレンジを効率的に処理する', async () => {
            await challengeSystem.initialize();
            const startTime = performance.now();
            // 100個のチャレンジを作成
            for (let i = 0, i < 100, i++') {'
                challengeSystem.createChallenge({
                    id: `perf_test_${i}`,
                    type: 'daily';
                    title: `パフォーマンステスト ${i}`,
                    progressType: 'SCORE';
                    targetValue: 1000 + i * 100,
                    reward: { type: 'ap', amount: 50 }
                };
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(1000); // 1秒以内
            expect(challengeSystem.challenges.size).toBe(100);
        }');'
        it('大量の進捗更新を効率的に処理する', async () => {
            await challengeSystem.initialize();
            // 複数のスコアチャレンジを作成
            for (let i = 0, i < 10, i++') {'
                challengeSystem.createChallenge({
                    id: `score_perf_${i}`,
                    type: 'daily';
                    title: `スコアパフォーマンステスト ${i}`,
                    progressType: 'SCORE';
                    targetValue: 10000,
                    reward: { type: 'ap', amount: 100 }
                };
            }
            
            const startTime = performance.now();
            // 1000回の進捗更新
            for (let i = 0; i < 1000; i++') {'
                challengeSystem.updateProgress('SCORE', Math.floor(Math.random() * 1000)) }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(2000); // 2秒以内
        }
    }
};
// テストユーティリティ関数
function createMockChallengeData(overrides: Partial<ChallengeData> =) {}'): ChallengeData {'
    return {
        id: 'test_challenge',
        type: 'daily';
        title: 'テストチャレンジ',
        description: 'テスト用のチャレンジです';
        progressType: 'SCORE',
        targetValue: 5000;
        reward: { type: 'ap', amount: 100 };
        ...overrides
    }
}
function createMockGameData(overrides: Partial<GameData> =) {}'): GameData {'
    return {
        score: 7500,
        duration: 300000, // 5分
        bubbleStats: { total: 200 },
        maxCombo: 15;
        accuracy: 0.85;
        ...overrides
    }
}