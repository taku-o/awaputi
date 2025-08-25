/**
 * AchievementNotificationSystem単体テスト
 */
import { describe, test, beforeEach, expect, jest } from '@jest/globals';
import { AchievementNotificationSystem } from '../../src/core/achievements/AchievementNotificationSystem.js';

// Type definitions for test objects
interface Achievement {
    id: string;
    name: string;
    description?: string;
    icon: string;
    reward?: {
        xp: number;
    };
    rarity: string;
}

interface PlaySoundOptions {
    volume?: number;
    loop?: boolean;
}

interface SoundRecord { 
    soundId: string; 
    options: PlaySoundOptions; 
}

interface Notification {
    type: string;
    achievement: Achievement;
    startTime: number;
    visible?: boolean;
}

interface NotificationSettings {
    displayDuration?: number;
    animationDuration?: number;
    maxVisibleNotifications?: number;
}

interface MockCanvasGradient {
    addColorStop: jest.Mock<void, [number, string]>;
}

interface MockCanvasRenderingContext2D {
    save: jest.Mock<void, []>;
    restore: jest.Mock<void, []>;
    clearRect: jest.Mock<void, [number, number, number, number]>;
    fillRect: jest.Mock<void, [number, number, number, number]>;
    strokeRect: jest.Mock<void, [number, number, number, number]>;
    beginPath: jest.Mock<void, []>;
    arc: jest.Mock<void, [number, number, number, number, number]>;
    fill: jest.Mock<void, []>;
    stroke: jest.Mock<void, []>;
    createLinearGradient: jest.Mock<MockCanvasGradient, [number, number, number, number]>;
    measureText: jest.Mock<{ width: number }, [string]>;
    fillText: jest.Mock<void, [string, number, number]>;
    strokeText: jest.Mock<void, [string, number, number]>;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    globalAlpha: number;
}

interface MockCanvas {
    width: number;
    height: number;
    getContext: jest.Mock<MockCanvasRenderingContext2D | null, [string]>;
}

// Mock AudioManagerクラス
class MockAudioManager {
    public playedSounds: SoundRecord[] = [];
    
    playSound(soundId: string, options: PlaySoundOptions = {}): boolean {
        this.playedSounds.push({ soundId, options });
        return true;
    }
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
            save: jest.fn(),
            restore: jest.fn(),
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()
            } as MockCanvasGradient)),
            measureText: jest.fn(() => ({ width: 100 })),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            font: '12px Arial',
            textAlign: 'left',
            textBaseline: 'top',
            globalAlpha: 1.0
        };
        
        // Canvas をモック
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: jest.fn(() => mockContext)
        };
        
        notificationSystem = new AchievementNotificationSystem(
            mockCanvas,
            mockAudioManager
        );
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(notificationSystem).toBeDefined();
            expect(notificationSystem.canvas).toBe(mockCanvas);
            expect(notificationSystem.audioManager).toBe(mockAudioManager);
        });

        test('デフォルト設定が適用される', () => {
            const settings = notificationSystem.getSettings();
            expect(settings.displayDuration).toBe(3000);
            expect(settings.animationDuration).toBe(500);
            expect(settings.maxVisibleNotifications).toBe(3);
        });

        test('通知キューが初期化される', () => {
            expect(notificationSystem.getActiveNotifications()).toHaveLength(0);
        });
    });

    describe('通知表示', () => {
        test('実績通知が正常に表示される', () => {
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                description: 'テスト用の実績です',
                icon: 'achievement_icon.png',
                reward: { xp: 100 },
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            
            const notifications = notificationSystem.getActiveNotifications();
            expect(notifications).toHaveLength(1);
            expect(notifications[0].achievement.id).toBe('test_achievement');
            expect(notifications[0].type).toBe('achievement_unlocked');
        });

        test('レベルアップ通知が正常に表示される', () => {
            notificationSystem.showLevelUp(5, 'バブル破壊レベル');
            
            const notifications = notificationSystem.getActiveNotifications();
            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('level_up');
        });

        test('特別実績通知が正常に表示される', () => {
            const achievement: Achievement = {
                id: 'special_achievement',
                name: '特別実績',
                icon: 'special_icon.png',
                rarity: 'legendary'
            };

            notificationSystem.showSpecialAchievement(achievement);
            
            const notifications = notificationSystem.getActiveNotifications();
            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('special_achievement');
        });

        test('最大表示数制限が適用される', () => {
            const achievement1: Achievement = {
                id: 'achievement_1',
                name: '実績1',
                icon: 'icon1.png',
                rarity: 'common'
            };
            const achievement2: Achievement = {
                id: 'achievement_2',
                name: '実績2', 
                icon: 'icon2.png',
                rarity: 'common'
            };
            const achievement3: Achievement = {
                id: 'achievement_3',
                name: '実績3',
                icon: 'icon3.png',
                rarity: 'common'
            };
            const achievement4: Achievement = {
                id: 'achievement_4',
                name: '実績4',
                icon: 'icon4.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement1);
            notificationSystem.showAchievementUnlocked(achievement2);
            notificationSystem.showAchievementUnlocked(achievement3);
            notificationSystem.showAchievementUnlocked(achievement4);
            
            const notifications = notificationSystem.getActiveNotifications();
            expect(notifications).toHaveLength(3); // maxVisibleNotifications = 3
        });
    });

    describe('音声再生', () => {
        test('実績アンロック時に音声が再生される', () => {
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                icon: 'icon.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            
            expect(mockAudioManager.playedSounds).toHaveLength(1);
            expect(mockAudioManager.playedSounds[0].soundId).toBe('achievement_unlocked');
        });

        test('レア実績では特別な音声が再生される', () => {
            const rareAchievement: Achievement = {
                id: 'rare_achievement',
                name: 'レア実績',
                icon: 'rare_icon.png',
                rarity: 'rare'
            };

            notificationSystem.showAchievementUnlocked(rareAchievement);
            
            expect(mockAudioManager.playedSounds).toHaveLength(1);
            expect(mockAudioManager.playedSounds[0].soundId).toBe('achievement_rare');
        });

        test('レジェンダリー実績では最上位の音声が再生される', () => {
            const legendaryAchievement: Achievement = {
                id: 'legendary_achievement',
                name: 'レジェンダリー実績',
                icon: 'legendary_icon.png',
                rarity: 'legendary'
            };

            notificationSystem.showAchievementUnlocked(legendaryAchievement);
            
            expect(mockAudioManager.playedSounds).toHaveLength(1);
            expect(mockAudioManager.playedSounds[0].soundId).toBe('achievement_legendary');
        });

        test('音声無効時は音声が再生されない', () => {
            notificationSystem.setSoundEnabled(false);
            
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                icon: 'icon.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            
            expect(mockAudioManager.playedSounds).toHaveLength(0);
        });
    });

    describe('描画処理', () => {
        test('通知が正常に描画される', () => {
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                description: 'テスト用の実績です',
                icon: 'icon.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            notificationSystem.render();
            
            // Canvas コンテキストの描画メソッドが呼ばれたことを確認
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillText).toHaveBeenCalled();
        });

        test('複数通知の描画が正常に処理される', () => {
            const achievement1: Achievement = {
                id: 'achievement_1',
                name: '実績1',
                icon: 'icon1.png',
                rarity: 'common'
            };
            const achievement2: Achievement = {
                id: 'achievement_2',
                name: '実績2',
                icon: 'icon2.png',
                rarity: 'rare'
            };

            notificationSystem.showAchievementUnlocked(achievement1);
            notificationSystem.showAchievementUnlocked(achievement2);
            notificationSystem.render();
            
            // 複数の通知が描画されたことを確認
            expect(mockContext.fillRect).toHaveBeenCalledTimes(4); // 背景とボーダー x2
            expect(mockContext.fillText).toHaveBeenCalledTimes(4); // 名前と説明 x2
        });

        test('フェードイン・フェードアウトアニメーションが適用される', () => {
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                icon: 'icon.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            
            // アニメーション開始時（フェードイン）
            notificationSystem.render();
            expect(mockContext.globalAlpha).toBeLessThan(1.0);
            
            // 時間経過をシミュレート
            jest.advanceTimersByTime(1000);
            notificationSystem.render();
            
            // フェードイン完了
            expect(mockContext.globalAlpha).toBe(1.0);
        });
    });

    describe('設定管理', () => {
        test('設定が正しく更新される', () => {
            const newSettings: NotificationSettings = {
                displayDuration: 5000,
                animationDuration: 1000,
                maxVisibleNotifications: 5
            };

            notificationSystem.updateSettings(newSettings);
            
            const settings = notificationSystem.getSettings();
            expect(settings.displayDuration).toBe(5000);
            expect(settings.animationDuration).toBe(1000);
            expect(settings.maxVisibleNotifications).toBe(5);
        });

        test('部分的な設定更新が正常に処理される', () => {
            const partialSettings: NotificationSettings = {
                displayDuration: 4000
            };

            notificationSystem.updateSettings(partialSettings);
            
            const settings = notificationSystem.getSettings();
            expect(settings.displayDuration).toBe(4000);
            expect(settings.animationDuration).toBe(500); // デフォルト値維持
            expect(settings.maxVisibleNotifications).toBe(3); // デフォルト値維持
        });
    });

    describe('通知管理', () => {
        test('通知の手動削除が正常に動作する', () => {
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                icon: 'icon.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            expect(notificationSystem.getActiveNotifications()).toHaveLength(1);
            
            notificationSystem.removeNotification('test_achievement');
            expect(notificationSystem.getActiveNotifications()).toHaveLength(0);
        });

        test('全通知のクリアが正常に動作する', () => {
            const achievement1: Achievement = {
                id: 'achievement_1',
                name: '実績1',
                icon: 'icon1.png',
                rarity: 'common'
            };
            const achievement2: Achievement = {
                id: 'achievement_2',
                name: '実績2',
                icon: 'icon2.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement1);
            notificationSystem.showAchievementUnlocked(achievement2);
            expect(notificationSystem.getActiveNotifications()).toHaveLength(2);
            
            notificationSystem.clearAllNotifications();
            expect(notificationSystem.getActiveNotifications()).toHaveLength(0);
        });

        test('自動削除タイマーが正常に動作する', () => {
            jest.useFakeTimers();
            
            const achievement: Achievement = {
                id: 'test_achievement',
                name: 'テスト実績',
                icon: 'icon.png',
                rarity: 'common'
            };

            notificationSystem.showAchievementUnlocked(achievement);
            expect(notificationSystem.getActiveNotifications()).toHaveLength(1);
            
            // 表示時間経過をシミュレート
            jest.advanceTimersByTime(3500); // displayDuration + animationDuration
            notificationSystem.update();
            
            expect(notificationSystem.getActiveNotifications()).toHaveLength(0);
            
            jest.useRealTimers();
        });
    });

    describe('エラーハンドリング', () => {
        test('存在しない通知の削除でもエラーが発生しない', () => {
            expect(() => {
                notificationSystem.removeNotification('non-existent');
            }).not.toThrow();
        });

        test('無効な設定値でもエラーが発生しない', () => {
            const invalidSettings = {
                displayDuration: -1000,
                maxVisibleNotifications: -5
            } as NotificationSettings;
            
            expect(() => {
                notificationSystem.updateSettings(invalidSettings);
            }).not.toThrow();
        });
    });
});