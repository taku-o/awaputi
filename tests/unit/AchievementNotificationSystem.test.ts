/**
 * AchievementNotificationSystem単体テスト
 */
import { describe, test, beforeEach, expect, jest  } from '@jest/globals';
import { AchievementNotificationSystem  } from '../../src/core/achievements/AchievementNotificationSystem.js';
// Type definitions for test objects
interface Achievement {
    id: string;
    name: string;
    description?: string;
    icon: string;
    reward?: {
        a,p: number,,
    rarity: string;
interface PlaySoundOptions {
    volume?: number;
    loop?: boolean;
interface SoundRecord {
    soundId: string;
    options: PlaySoundOptions;
interface Notification {
    type: string;
    achievement: Achievement;
    startTime: number;
    visible?: boolean;
interface NotificationSettings {
    displayDuration?: number;
    animationDuration?: number;
    maxVisibleNotifications?: number;
interface MockCanvasGradient {
    addColorStop: jest.Mock }
interface MockCanvasRenderingContext2D {
    save: jest.Mock;
    restore: jest.Mock;
    clearRect: jest.Mock;
    fillRect: jest.Mock;
    strokeRect: jest.Mock;
    beginPath: jest.Mock;
    arc: jest.Mock;
    fill: jest.Mock;
    stroke: jest.Mock;
    createLinearGradient: jest.Mock;
    measureText: jest.Mock;
    fillText: jest.Mock;
    strokeText: jest.Mock;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    globalAlpha: number;
interface MockCanvas {
    width: number;
    height: number;
    getContext: jest.Mock }
// Mock AudioManagerクラス
class MockAudioManager {
    public playedSounds: SoundRecord[] = [];
    playSound(soundId: string, options: PlaySoundOptions = {): boolean {
        this.playedSounds.push({ soundId, options )'),'
        return true }
}
describe('AchievementNotificationSystem', () => {
    let notificationSystem: AchievementNotificationSystem;
    let mockAudioManager: MockAudioManager;
    let mockCanvas: MockCanvas;
    let mockContext: MockCanvasRenderingContext2D;
    beforeEach(() => {
        mockAudioManager = new MockAudioManager();
        // Canvas context をモック
        mockContext = {
            save: jest.fn(
            restore: jest.fn(
            clearRect: jest.fn(
            fillRect: jest.fn(
            strokeRect: jest.fn(
            beginPath: jest.fn(
            arc: jest.fn(
            fill: jest.fn(
            stroke: jest.fn(
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn() as MockCanvasGradient);
            measureText: jest.fn(() => ({ width: 100 ));
           , fillText: jest.fn(
            strokeText: jest.fn(','
            fillStyle: ','
            strokeStyle: ','
            lineWidth: 1;
            font: '14px Arial';
            textAlign: 'left';
            textBaseline: 'top';
            globalAlpha: 1
    };
        mockCanvas = {
            width: 800;
            height: 600;
            getContext: jest.fn(() => mockContext));
        notificationSystem = new AchievementNotificationSystem(mockAudioManager);
    )');'
    describe('初期化', (') => {'
        test('正常に初期化される', () => {
            expect(notificationSystem).toBeDefined();
            expect(notificationSystem.audioManager).toBe(mockAudioManager);
            expect(notificationSystem.notificationQueue).toEqual([]))'),'
        test('設定が正しく初期化される', () => {
            expect(notificationSystem.displayDuration).toBe(4000);
            expect(notificationSystem.animationDuration).toBe(500);
            expect(notificationSystem.maxVisibleNotifications).toBe(3) }');'
    }
    describe('通知表示', (') => {'
        test('実績解除通知が正しく表示される', (') => {'
            const achievement: Achievement = {
                id: 'first_score';
                name: 'はじめてのスコア';
                description: '初回スコア獲得';
                icon: '🎯';
                reward: { ap: 10 };
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            expect(notificationSystem.notificationQueue.length).toBe(1);
            const notification = notificationSystem.notificationQueue[0];
            expect(notification.type').toBe('unlock');'
            expect(notification.achievement).toBe(achievement);
            expect(notification.startTime).toBeDefined();
        }');'
        test('レアリティ別の通知デザインが適用される', (') => {'
            const rarities = ['common', 'rare', 'epic', 'legendary'],
            
            rarities.forEach(rarity => {
                const achievement: Achievement = {
                    id: `test_${rarity}`;
                    name: `Test ${rarity}`;
                    icon: '🏆';
                    rarity: rarity,);
                notificationSystem.showUnlockNotification(achievement);
            };
            expect(notificationSystem.notificationQueue.length).toBe(4);
            // 各レアリティの通知が正しく設定されていることを確認
            notificationSystem.notificationQueue.forEach(notification => {'),'
                expect(['common', 'rare', 'epic', 'legendary']).toContain(notification.achievement.rarity) }');'
        }
        test('最大表示数を超える通知は待機列に追加される', () => {
            // 最大表示数（3）を超える通知を追加
            for (let i = 0, i < 5, i++') {'
                const achievement: Achievement = {
                    id: `test_${i}`;
                    name: `Test ${i}`;
                    icon: '🏆';
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            expect(notificationSystem.notificationQueue.length).toBe(5);
            // 表示中の通知数を確認
            const visibleNotifications = notificationSystem.notificationQueue.filter(n => n.visible);
            expect(visibleNotifications.length).toBeLessThanOrEqual(3);
        }');'
    }
    describe('通知キュー管理', (') => {'
        test('通知が順次表示される', (done) => {
            const achievements: Achievement[] = Array.from({length: 3}, (_, i') => ({'
                id: `test_${i}`;
                name: `Test ${i}`;
                icon: '🏆';
                rarity: 'common'
            };
            achievements.forEach(achievement => {);
                notificationSystem.showUnlockNotification(achievement) };
            // 最初の通知を処理
            notificationSystem.update(16); // 1フレーム
            setTimeout(() => {
                expect(notificationSystem.notificationQueue.length).toBeGreaterThan(0);
                done() }, 100);
        }');'
        test('期限切れ通知が正しく削除される', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            // 通知を期限切れに設定
            const notification = notificationSystem.notificationQueue[0];
            notification.startTime = Date.now() - (notificationSystem.displayDuration + 1000);
            notificationSystem.update(16);
            expect(notificationSystem.notificationQueue.length).toBe(0);
        }');'
        test('通知キューのクリアが正しく動作する', () => {
            // 複数の通知を追加
            for (let i = 0, i < 3, i++') {'
                const achievement: Achievement = {
                    id: `test_${i}`;
                    name: `Test ${i}`;
                    icon: '🏆';
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            notificationSystem.clearNotifications();
            expect(notificationSystem.notificationQueue.length).toBe(0);
        }');'
    }
    describe('レンダリング', (') => {'
        test('通知ポップアップが正しく描画される', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'テスト実績';
                description: 'テスト用の実績です';
                icon: '🏆';
                reward: { ap: 50 };
                rarity: 'epic'
            };
            notificationSystem.showUnlockNotification(achievement);
            notificationSystem.render(mockContext: any, mockCanvas);
            // 描画メソッドが呼ばれたことを確認
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillText).toHaveBeenCalled();
        }');'
        test('レアリティ別の背景グラデーションが適用される', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'legendary'
            };
            notificationSystem.showUnlockNotification(achievement);
            notificationSystem.render(mockContext: any, mockCanvas);
            expect(mockContext.createLinearGradient).toHaveBeenCalled();
        }');'
        test('アニメーション効果が正しく計算される', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            // アニメーション開始直後
            notificationSystem.update(16);
            notificationSystem.render(mockContext: any, mockCanvas);
            // globalAlphaが設定されることを確認
            expect(mockContext.globalAlpha).toBeDefined();
        }');'
        test('複数通知の位置調整が正しく動作する', () => {
            // 複数の通知を追加
            for (let i = 0, i < 3, i++') {'
                const achievement: Achievement = {
                    id: `test_${i}`;
                    name: `Test ${i}`;
                    icon: '🏆';
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            notificationSystem.render(mockContext: any, mockCanvas);
            // 複数の描画が行われることを確認
            expect(mockContext.fillRect).toHaveBeenCalledTimes(expect.any(Number);
        }');'
    }
    describe('音響効果', (') => {'
        test('実績解除時に音が再生される', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            expect(mockAudioManager.playedSounds.length).toBe(1);
            expect(mockAudioManager.playedSounds[0].soundId').toBe('achievement_unlock');'
        }');'
        test('レアリティ別の音響効果が再生される', (') => {'
            const rarities = ['common', 'rare', 'epic', 'legendary'],
            
            rarities.forEach(rarity => {
                const achievement: Achievement = {
                    id: `test_${rarity}`;
                    name: `Test ${rarity}`;
                    icon: '🏆';
                    rarity: rarity,);
                notificationSystem.showUnlockNotification(achievement);
            };
            expect(mockAudioManager.playedSounds.length).toBe(4);
            // 各レアリティに応じた音が再生されることを確認
            mockAudioManager.playedSounds.forEach(sound => {);
                expect(sound.soundId).toMatch(/achievement_/) }');'
        }
        test('音響なしモードが正しく動作する', () => {
            (notificationSystem.enableAudio = false'),'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            expect(mockAudioManager.playedSounds.length).toBe(0);
        }');'
    }
    describe('アニメーション', (') => {'
        test('フェードイン・アウトアニメーションが正しく動作する', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            const notification = notificationSystem.notificationQueue[0];
            
            // フェードイン期間中
            notification.startTime = Date.now() - 100; // 100ms経過
            const fadeInAlpha = notificationSystem.calculateNotificationAlpha(notification);
            expect(fadeInAlpha).toBeGreaterThan(0);
            expect(fadeInAlpha).toBeLessThanOrEqual(1);
            // 表示期間中
            notification.startTime = Date.now() - 1000; // 1秒経過
            const visibleAlpha = notificationSystem.calculateNotificationAlpha(notification);
            expect(visibleAlpha).toBe(1);
            // フェードアウト期間中
            notification.startTime = Date.now() - (notificationSystem.displayDuration - 100); // フェードアウト開始
            const fadeOutAlpha = notificationSystem.calculateNotificationAlpha(notification);
            expect(fadeOutAlpha).toBeGreaterThanOrEqual(0);
            expect(fadeOutAlpha).toBeLessThan(1);
        }');'
        test('スライド効果が正しく計算される', (') => {'
            const achievement: Achievement = {
                id: 'test';
                name: 'Test';
                icon: '🏆';
                rarity: 'common'
            };
            notificationSystem.showUnlockNotification(achievement);
            const notification = notificationSystem.notificationQueue[0];
            
            // スライドイン期間中
            notification.startTime = Date.now() - 100;
            const slideOffset = notificationSystem.calculateSlideOffset(notification);
            expect(slideOffset).toBeGreaterThanOrEqual(0);
        }');'
    }
    describe('設定管理', (') => {'
        test('表示設定が正しく更新される', () => {
            notificationSystem.updateSettings({
                displayDuration: 5000;
                animationDuration: 800;
                maxVisibleNotifications: 5 };
            expect(notificationSystem.displayDuration).toBe(5000);
            expect(notificationSystem.animationDuration).toBe(800);
            expect(notificationSystem.maxVisibleNotifications).toBe(5);
        }');'
        test('無効な設定値は無視される', (') => {'
            const originalDuration = notificationSystem.displayDuration,
            
            notificationSystem.updateSettings({
                displayDuration: -1000, // 無効な値
                animationDuration: 'invalid' as any // 無効な型 };
            expect(notificationSystem.displayDuration).toBe(originalDuration);
        }');'
    }
    describe('パフォーマンス', (') => {'
        test('大量の通知でもパフォーマンスが維持される', () => {
            const startTime = performance.now();
            // 大量の通知を追加
            for (let i = 0, i < 100, i++') {'
                const achievement: Achievement = {
                    id: `test_${i}`;
                    name: `Test ${i}`;
                    icon: '🏆';
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            notificationSystem.update(16);
            notificationSystem.render(mockContext: any, mockCanvas);
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            // 処理時間が妥当な範囲内であることを確認（100ms以下）
            expect(processingTime).toBeLessThan(100);
        }');'
        test('メモリリークが発生しない', () => {
            // 通知を追加して削除を繰り返す
            for (let i = 0, i < 50, i++') {'
                const achievement: Achievement = {
                    id: `test_${i}`;
                    name: `Test ${i}`;
                    icon: '🏆';
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
                // すぐに期限切れにして削除
                const notification = notificationSystem.notificationQueue[notificationSystem.notificationQueue.length - 1];
                notification.startTime = Date.now() - 10000;
                notificationSystem.update(16);
            }
            // キューが適切にクリアされていることを確認
            expect(notificationSystem.notificationQueue.length).toBe(0);
        };
    }
}');'