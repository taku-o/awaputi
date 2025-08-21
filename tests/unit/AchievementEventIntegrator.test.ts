/**
 * AchievementEventIntegrator単体テスト
 */
import { describe, test, beforeEach, expect  } from '@jest/globals';
import { AchievementEventIntegrator  } from '../../src/core/AchievementEventIntegrator.js';
// Type definitions for test objects
interface BubbleObject {
    type: string,
    x?: number;
    y?: number;
}
interface PopResult {
    score: number,
    combo: number,
}
interface GameOverResult {
    reason: string,
    score: number,
}
interface Achievement {
    id: string,
    unlocked: boolean,
    progress: {
        curren;t: number,
        target: number,
    };
}
interface SessionData {
    startTime: number,
}
interface PlayerDataStats {
    bubbleTypes: {
        normal: {
            poppe;d: number,
        };
    };
    sessionData: SessionData,
}
interface UpdateProgressCall {
    achievementId: string,
    value: number,
}
interface SessionUpdate {
    bubblesPopped?: number;
    score?: number;
    combo?: number;
}
// Mock classes
class MockAchievementManager {
    public updateProgressCalls: UpdateProgressCall[] = [],
    public checkAndUnlockCalls: string[] = [],
    updateProgress(achievementId: string, value: number): void {
        this.updateProgressCalls.push({ achievementId, value );
    }
    checkAndUnlockAchievement(achievementId: string): boolean {
        this.checkAndUnlockCalls.push(achievementId);
        return true;
    }
    getAchievement(id: string): Achievement {
        return { id, unlocked: false, progress: { current: 0, target: 100 } };
    }
}
class MockBubbleManager {
    public popBubbleOriginal: (bubble: BubbleObject) => PopResult;
    constructor() {
        this.popBubbleOriginal = this.popBubble.bind(this);
    }
    popBubble(bubble: BubbleObject): PopResult {
        return { score: 10, combo: 1 };
    }
}
class MockScoreManager {
    public addScoreOriginal: (points: number, multiplier?: number) => number;
    public breakComboOriginal: () => boolean;
    constructor() {
        this.addScoreOriginal = this.addScore.bind(this);
        this.breakComboOriginal = this.breakCombo.bind(this);
    }
    addScore(points: number, multiplier: number = 1): number {
        return points * multiplier;
    }
    breakCombo(): boolean {
        return true;
    }
}
class MockGameScene {
    public gameOverOriginal: (reason: string) => GameOverResult;
    constructor() {
        this.gameOverOriginal = this.gameOver.bind(this);
    }
    gameOver(reason: string): GameOverResult {
        return { reason, score: 1000 };
    }
}
class MockPlayerData {
    public data: {
        totalBubblesPopped: number,
        totalScore: number,
        sessionData: SessionData,
    };
    constructor() {
        this.data = {
            totalBubblesPopped: 0,
            totalScore: 0,
            sessionData: { startTime: Date.now() }
        };
    }
    get(key: string): any {
        return (this.data: any)[key],
    }
    getDetailedStatistics('): PlayerDataStats {
        return {
            bubbleTypes: { normal: { popped: 10 } };
            sessionData: this.data.sessionData
        };
    }
}
describe('AchievementEventIntegrator', () => {
    let integrator: AchievementEventIntegrator,
    let mockAchievementManager: MockAchievementManager,
    let mockBubbleManager: MockBubbleManager,
    let mockScoreManager: MockScoreManager,
    let mockGameScene: MockGameScene,
    let mockPlayerData: MockPlayerData,
    beforeEach(() => {
        mockAchievementManager = new MockAchievementManager();
        mockBubbleManager = new MockBubbleManager();
        mockScoreManager = new MockScoreManager();
        mockGameScene = new MockGameScene();
        mockPlayerData = new MockPlayerData();
        integrator = new AchievementEventIntegrator(
            mockAchievementManager,
            mockPlayerData
        );
    }');
    describe('初期化', (') => {
        test('正常に初期化される', () => {
            expect(integrator).toBeDefined();
            expect(integrator.achievementManager).toBe(mockAchievementManager);
            expect(integrator.playerData).toBe(mockPlayerData);
        }');
        test('セッション追跡が初期化される', () => {
            expect(integrator.sessionTracking).toBeDefined();
            expect(integrator.sessionTracking.bubblesPopped).toBe(0);
            expect(integrator.sessionTracking.startTime).toBeDefined();
        }');
    }
    describe('BubbleManager統合', () => {
        beforeEach(() => {
            integrator.integrateBubbleManager(mockBubbleManager);
        }');
        test('popBubbleメソッドが正しく拡張される', (') => {
            const bubble: BubbleObject = { type: 'normal', x: 100, y: 100 };
            
            const result = mockBubbleManager.popBubble(bubble);
            expect(result).toBeDefined();
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
        test('バブルタイプ別統計が更新される', (') => {
            const normalBubble: BubbleObject = { type: 'normal' };
            const stoneBubble: BubbleObject = { type: 'stone' };
            
            mockBubbleManager.popBubble(normalBubble);
            mockBubbleManager.popBubble(stoneBubble');
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => call.achievementId.includes('normal')).toBe(true');
            expect(updateCalls.some(call => call.achievementId.includes('stone')).toBe(true);
        }');
        test('特殊バブル効果が追跡される', (') => {
            const rainbowBubble: BubbleObject = { type: 'rainbow' };
            
            mockBubbleManager.popBubble(rainbowBubble);
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('rainbow'') || 
                call.achievementId.includes('special')).toBe(true);
        }');
        test('速度チャレンジが追跡される', () => {
            // 短時間で複数のバブルをポップ
            const startTime = Date.now();
            integrator.sessionTracking.startTime = startTime;
            
            for (let i = 0; i < 10; i++') {
                mockBubbleManager.popBubble({ type: 'normal' });
            }
            
            // 速度実績の更新があることを確認
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('speed'') || 
                call.achievementId.includes('rapid')).toBe(true);
        }');
    }
    describe('ScoreManager統合', () => {
        beforeEach(() => {
            integrator.integrateScoreManager(mockScoreManager);
        }');
        test('addScoreメソッドが正しく拡張される', () => {
            const result = mockScoreManager.addScore(100, 2);
            expect(result).toBe(200);
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
        test('スコア実績が更新される', () => {
            mockScoreManager.addScore(1000');
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => 
                call.achievementId.includes('score'})).toBe(true);
        }');
        test('コンボ追跡が動作する', () => {
            // コンボを構築
            integrator.sessionTracking.currentCombo = 5;
            mockScoreManager.addScore(100);
            // コンボを破る
            mockScoreManager.breakCombo();
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('combo')).toBe(true);
        }');
        test('高倍率スコア実績が追跡される', () => {
            mockScoreManager.addScore(100, 5); // 5倍倍率
            
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('multiplier'') || 
                call.achievementId.includes('bonus')).toBe(true);
        }');
    }
    describe('GameScene統合', () => {
        beforeEach(() => {
            integrator.integrateGameScene(mockGameScene);
        }');
        test('gameOverメソッドが正しく拡張される', (') => {
            const result = mockGameScene.gameOver('cleared');
            expect(result).toBeDefined();
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
        test('ゲームクリア実績が更新される', (') => {
            mockGameScene.gameOver('cleared');
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('clear'') || 
                call.achievementId.includes('complete')).toBe(true);
        }');
        test('プレイ時間実績が追跡される', () => {
            // セッション時間をシミュレート
            integrator.sessionTracking.startTime = Date.now(') - 60000; // 1分前
            
            mockGameScene.gameOver('cleared');
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('time'') || 
                call.achievementId.includes('playtime')).toBe(true);
        }');
        test('低HP生存実績が追跡される', (') => {
            // 低HP状態をシミュレート
            integrator.sessionTracking.lowHPSurvival = true;
            
            mockGameScene.gameOver('cleared');
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('survival'') || 
                call.achievementId.includes('hp')).toBe(true);
        }');
        test('パーフェクトゲーム実績が追跡される', (') => {
            // パーフェクトゲーム条件をシミュレート
            integrator.sessionTracking.damageReceived = 0;
            integrator.sessionTracking.accuracy = 100;
            
            mockGameScene.gameOver('cleared');
            const updateCalls = mockAchievementManager.updateProgressCalls;
            expect(updateCalls.some(call => ');
                call.achievementId.includes('perfect'') || 
                call.achievementId.includes('flawless')).toBe(true);
        }');
    }
    describe('イベント処理', (') => {
        test('バブルポップイベントが正しく処理される', (') => {
            integrator.handleBubblePopped('normal', { x: 100, y: 100 });
            expect(integrator.sessionTracking.bubblesPopped).toBe(1);
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
        test('スコア追加イベントが正しく処理される', () => {
            integrator.handleScoreAdded(100, 2);
            expect(integrator.sessionTracking.totalScore).toBe(200);
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
        test('ゲーム終了イベントが正しく処理される', (') => {
            integrator.handleGameOver('cleared');
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
        test('複数イベントの連続処理が正しく動作する', (') => {
            integrator.handleBubblePopped('normal', { x: 100, y: 100 });
            integrator.handleScoreAdded(100');
            integrator.handleBubblePopped('stone', { x: 200, y: 200 }');
            integrator.handleGameOver('cleared');
            expect(integrator.sessionTracking.bubblesPopped).toBe(2);
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(0);
        }');
    }
    describe('セッション追跡', (') => {
        test('セッション統計が正しく更新される', () => {
            integrator.updateSessionTracking({
                bubblesPopped: 5,
                score: 500,
                combo: 3),
            });
            expect(integrator.sessionTracking.bubblesPopped).toBe(5);
            expect(integrator.sessionTracking.totalScore).toBe(500);
            expect(integrator.sessionTracking.currentCombo).toBe(3);
        }');
        test('セッションリセットが正しく動作する', () => {
            // セッションデータを設定
            integrator.sessionTracking.bubblesPopped = 10;
            integrator.sessionTracking.totalScore = 1000;
            
            integrator.resetSessionTracking();
            expect(integrator.sessionTracking.bubblesPopped).toBe(0);
            expect(integrator.sessionTracking.totalScore).toBe(0);
            expect(integrator.sessionTracking.startTime).toBeDefined();
        }');
        test('セッション時間計算が正しく動作する', () => {
            const startTime = Date.now() - 60000; // 1分前
            integrator.sessionTracking.startTime = startTime;
            
            const sessionTime = integrator.getSessionTime();
            expect(sessionTime).toBeGreaterThanOrEqual(60000);
            expect(sessionTime).toBeLessThan(70000); // 多少の誤差を許容
        }');
    }
    describe('統合テスト', (') => {
        test('完全なゲームフローでの実績更新', () => {
            // 統合を設定
            integrator.integrateBubbleManager(mockBubbleManager);
            integrator.integrateScoreManager(mockScoreManager);
            integrator.integrateGameScene(mockGameScene');
            // ゲームプレイをシミュレート
            mockBubbleManager.popBubble({ type: 'normal' });
            mockScoreManager.addScore(100');
            mockBubbleManager.popBubble({ type: 'stone' ),
            mockScoreManager.addScore(200, 2');
            mockGameScene.gameOver('cleared');
            // 実績更新が行われたことを確認
            expect(mockAchievementManager.updateProgressCalls.length).toBeGreaterThan(5);
            // 各種実績タイプの更新を確認
            const updateCalls = mockAchievementManager.updateProgressCalls;
            const achievementTypes = updateCalls.map(call => call.achievementId');
            expect(achievementTypes.some(id => id.includes('pop')).toBe(true');
            expect(achievementTypes.some(id => id.includes('score')).toBe(true);
        });
    }
}');