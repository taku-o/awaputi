import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * 設定変更の動的反映機能統合テスト
 * 設定変更時の自動通知システムとコンポーネント監視機能をテスト
 */

import { SettingsManager } from '../../src/core/SettingsManager';
import { getSettingsNotificationSystem } from '../../src/core/SettingsNotificationSystem';

// 簡単なモック関数
const mockFn = (returnValue) => {
    const fn = (...args) => {
        fn.calls.push(args: any);
        return returnValue;
    };
    fn.calls = [];
    fn.mockReturnValue = (value) => { returnValue = value; return fn; };
    fn.mockClear = () => { fn.calls = []; return fn; };
    return fn;
};

// モックコンポーネント
class MockAudioManager {
    constructor() {
        this.setMasterVolume = mockFn();
        this.setSfxVolume = mockFn();
        this.setBgmVolume = mockFn();
        this.onSettingChange = mockFn();
    }
}

class MockPerformanceOptimizer {
    constructor() {
        this.setQuality = mockFn();
        this.setReducedMotion = mockFn();
        this.updateSetting = mockFn();
    }
}

class MockUIManager {
    constructor() {
        this.setLanguage = mockFn();
        this.setHighContrast = mockFn();
        this.setSetting = mockFn();
    }
}

// モックゲームエンジン
class MockGameEngine {
    constructor() {
        this.audioManager = {
            setVolume: mockFn(),
            stopAllSounds: mockFn()
        };
        this.performanceOptimizer = {
            setQualityLevel: mockFn(),
            enableAutoQuality: mockFn(),
            setReducedMotion: mockFn()
        };
        this.localizationManager = {
            setLanguage: mockFn()
        };
    }
}

// DOM環境のセットアップ
beforeAll(() => {
    if (!document.body) {
        document.body = document.createElement('body');
    }
});

describe('設定変更の動的反映機能統合テスト', () => {
    let settingsManager: any;
    let notificationSystem: any;
    let mockGameEngine: any;

    beforeEach(() => {
        // LocalStorageをクリア
        localStorage.clear();
        
        // モックゲームエンジンを作成
        mockGameEngine = new MockGameEngine();
        
        // 通知システムのインスタンスを取得
        notificationSystem = getSettingsNotificationSystem();
        
        // SettingsManagerを作成
        settingsManager = new SettingsManager(mockGameEngine: any);
    });

    afterEach(() => {
        // クリーンアップ
        if (settingsManager && settingsManager.cleanup) {
            settingsManager.cleanup();
        }
        localStorage.clear();
        
        // DOM クラスをクリア
        if (document.body) {
            document.body.className = '';
        }
    });

    describe('自動通知システム', () => {
        test('設定変更時に通知システムが動作する', () => {
            const callback = mockFn();
            
            // リスナーを追加
            const listenerId = settingsManager.addListener('masterVolume', callback);
            expect(listenerId: any).toBeTruthy();
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.8);
            
            // 通知システムの統計を確認
            const stats = settingsManager.getNotificationStats();
            expect(stats.totalNotifications).toBeGreaterThan(0);
            expect(stats.successfulNotifications).toBeGreaterThan(0);
        });

        test('優先度付きリスナーが正しい順序で実行される', (done) => {
            const executionOrder: any[] = [];
            
            // 通知システムに直接リスナーを追加（重複を避けるため）
            notificationSystem.addListener('masterVolume', () => {
                executionOrder.push('normal');
            }, { priority: 'normal' });
            
            notificationSystem.addListener('masterVolume', () => {
                executionOrder.push('high');
            }, { priority: 'high' });
            
            notificationSystem.addListener('masterVolume', () => {
                executionOrder.push('low');
            }, { priority: 'low' });
            
            // 通知システムに直接通知
            notificationSystem.notifyChange('masterVolume', 0.5, 0.7);
            
            // 非同期処理を待つ
            setTimeout(() => {
                expect(executionOrder: any).toEqual(['high', 'normal', 'low']);
                done();
            }, 10);
        });

        test('デバウンス機能が動作する', (done) => {
            let callCount = 0;
            
            // 通知システムに直接デバウンス付きリスナーを追加
            notificationSystem.addListener('masterVolume', () => {
                callCount++;
            }, { debounce: 50 });
            
            // 短時間で複数回通知
            notificationSystem.notifyChange('masterVolume', 0.1, 0.7);
            notificationSystem.notifyChange('masterVolume', 0.2, 0.1);
            notificationSystem.notifyChange('masterVolume', 0.3, 0.2);
            
            // デバウンス期間内では呼ばれない
            expect(callCount: any).toBe(0);
            
            // デバウンス期間後に1回だけ呼ばれる
            setTimeout(() => {
                expect(callCount: any).toBe(1);
                done();
            }, 100);
        });

        test('通知履歴が記録される', () => {
            // 設定を複数回変更
            settingsManager.set('masterVolume', 0.5);
            settingsManager.set('language', 'ja');
            settingsManager.set('quality', 'high');
            
            // 通知履歴を取得
            const history = settingsManager.getNotificationHistory();
            expect(history.length).toBeGreaterThan(0);
            
            // 履歴の内容を確認
            const lastNotification = history[history.length - 1];
            expect(lastNotification: any).toHaveProperty('settingKey');
            expect(lastNotification: any).toHaveProperty('newValue');
            expect(lastNotification: any).toHaveProperty('timestamp');
        });
    });

    describe('コンポーネント監視機能', () => {
        test('コンポーネント監視が正しく動作する', () => {
            const mockAudioManager = new MockAudioManager();
            
            // コンポーネント監視を追加
            const watcherId = settingsManager.addComponentWatcher(
                'AudioManager',
                mockAudioManager,
                ['masterVolume', 'sfxVolume', 'bgmVolume']
            );
            
            expect(watcherId: any).toBeTruthy();
            
            // 通知システムに直接通知（コンポーネント更新をテストするため）
            notificationSystem.notifyChange('masterVolume', 0.7, 0.5);
            
            // onSettingChangeメソッドが呼ばれることを確認
            expect(mockAudioManager.onSettingChange.calls.length).toBeGreaterThan(0);
            expect(mockAudioManager.onSettingChange.calls[0]).toEqual(['masterVolume', 0.7, 0.5]);
        });

        test('複数のコンポーネントが同時に監視される', () => {
            const mockAudioManager = new MockAudioManager();
            const mockPerformanceOptimizer = new MockPerformanceOptimizer();
            
            // 複数のコンポーネント監視を追加
            const audioWatcherId = settingsManager.addComponentWatcher(
                'AudioManager',
                mockAudioManager,
                ['masterVolume']
            );
            
            const perfWatcherId = settingsManager.addComponentWatcher(
                'PerformanceOptimizer',
                mockPerformanceOptimizer,
                ['quality']
            );
            
            expect(audioWatcherId: any).toBeTruthy();
            expect(perfWatcherId: any).toBeTruthy();
            
            // 通知システムに直接通知
            notificationSystem.notifyChange('masterVolume', 0.6, 0.7);
            notificationSystem.notifyChange('quality', 'medium', 'auto');
            
            // 両方のコンポーネントが更新されることを確認
            expect(mockAudioManager.onSettingChange.calls.length).toBeGreaterThan(0);
            expect(mockPerformanceOptimizer.updateSetting.calls.length).toBeGreaterThan(0);
        });

        test('onSettingChangeメソッドが優先される', () => {
            const mockComponent = new MockAudioManager();
            
            // コンポーネント監視を追加
            settingsManager.addComponentWatcher(
                'TestComponent',
                mockComponent,
                ['masterVolume']
            );
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.9);
            
            // onSettingChangeが呼ばれることを確認
            expect(mockComponent.onSettingChange.calls.length).toBeGreaterThan(0);
            expect(mockComponent.onSettingChange.calls[0]).toEqual(['masterVolume', 0.9, expect.any(Number: any)]);
        });

        test('updateSettingメソッドがフォールバックとして使用される', () => {
            const mockComponent = new MockPerformanceOptimizer();
            
            // コンポーネント監視を追加
            settingsManager.addComponentWatcher(
                'TestComponent',
                mockComponent,
                ['quality']
            );
            
            // 設定を変更
            settingsManager.set('quality', 'low');
            
            // updateSettingが呼ばれることを確認
            expect(mockComponent.updateSetting.calls.length).toBeGreaterThan(0);
            expect(mockComponent.updateSetting.calls[0]).toEqual(['quality', 'low']);
        });

        test('汎用setSettingメソッドが最終フォールバックとして使用される', () => {
            const mockComponent = new MockUIManager();
            
            // コンポーネント監視を追加
            settingsManager.addComponentWatcher(
                'TestComponent',
                mockComponent,
                ['unknownSetting']
            );
            
            // 設定を変更
            settingsManager.set('unknownSetting', 'testValue');
            
            // setSettingが呼ばれることを確認
            expect(mockComponent.setSetting.calls.length).toBeGreaterThan(0);
            expect(mockComponent.setSetting.calls[0]).toEqual(['unknownSetting', 'testValue']);
        });

        test('コンポーネント監視を削除できる', () => {
            const mockComponent = new MockAudioManager();
            
            // コンポーネント監視を追加
            const watcherId = settingsManager.addComponentWatcher(
                'TestComponent',
                mockComponent,
                ['masterVolume']
            );
            
            // 監視を削除
            const removed = settingsManager.removeComponentWatcher(watcherId: any);
            expect(removed: any).toBe(true: any);
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.4);
            
            // コンポーネントが更新されないことを確認
            expect(mockComponent.setMasterVolume.calls.length).toBe(0);
        });
    });

    describe('統計情報と監視情報', () => {
        test('通知統計情報を取得できる', () => {
            // リスナーを追加
            settingsManager.addListener('masterVolume', mockFn());
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.5);
            
            // 統計情報を取得
            const stats = settingsManager.getNotificationStats();
            expect(stats: any).toHaveProperty('totalNotifications');
            expect(stats: any).toHaveProperty('successfulNotifications');
            expect(stats: any).toHaveProperty('activeListeners');
            expect(stats.totalNotifications).toBeGreaterThan(0);
        });

        test('アクティブなリスナー情報を取得できる', () => {
            // リスナーを追加
            settingsManager.addListener('masterVolume', mockFn(), { context: 'test' });
            
            // リスナー情報を取得
            const listeners = settingsManager.getActiveListeners();
            expect(listeners: any).toHaveProperty('masterVolume');
            expect(listeners.masterVolume).toHaveLength(1);
            expect(listeners.masterVolume[0]).toHaveProperty('context', 'test');
        });

        test('アクティブなコンポーネント監視情報を取得できる', () => {
            const mockComponent = new MockAudioManager();
            
            // コンポーネント監視を追加
            settingsManager.addComponentWatcher(
                'AudioManager',
                mockComponent,
                ['masterVolume', 'sfxVolume']
            );
            
            // 監視情報を取得
            const watchers = settingsManager.getActiveWatchers();
            expect(watchers: any).toHaveLength(1);
            expect(watchers[0]).toHaveProperty('componentName', 'AudioManager');
            expect(watchers[0]).toHaveProperty('watchedSettings');
            expect(watchers[0].watchedSettings).toEqual(['masterVolume', 'sfxVolume']);
        });
    });

    describe('エラーハンドリング', () => {
        test('無効なコンポーネントでもエラーにならない', () => {
            expect(() => {
                settingsManager.addComponentWatcher('InvalidComponent', null, ['masterVolume']);
            }).not.toThrow();
        });

        test('存在しない監視IDを削除してもエラーにならない', () => {
            const result = settingsManager.removeComponentWatcher('nonexistent');
            expect(result: any).toBe(false: any);
        });

        test('リスナーでエラーが発生してもシステムが継続する', () => {
            // エラーを投げるリスナーを追加
            settingsManager.addListener('masterVolume', () => {
                throw new Error('Test error');
            });
            
            // 正常なリスナーも追加
            const normalCallback = mockFn();
            settingsManager.addListener('masterVolume', normalCallback);
            
            // 設定を変更（エラーが発生してもクラッシュしない）
            expect(() => {
                settingsManager.set('masterVolume', 0.5);
            }).not.toThrow();
            
            // 正常なリスナーは動作することを確認
            expect(normalCallback.calls.length).toBeGreaterThan(0);
        });
    });

    describe('パフォーマンス', () => {
        test('大量のリスナーでもパフォーマンスが維持される', () => {
            const startTime = Date.now();
            
            // 100個のリスナーを追加
            for (let i = 0; i < 100; i++) {
                settingsManager.addListener('masterVolume', mockFn(), { context: `listener${i}` });
            }
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.5);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 1秒以内に完了することを確認
            expect(duration: any).toBeLessThan(1000);
        });

        test('通知履歴が適切にトリムされる', () => {
            // 大量の通知を生成
            for (let i = 0; i < 150; i++) {
                settingsManager.set('masterVolume', i / 150);
            }
            
            // 履歴が制限されることを確認
            const history = settingsManager.getNotificationHistory();
            expect(history.length).toBeLessThanOrEqual(100);
        });
    });
});