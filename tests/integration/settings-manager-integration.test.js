/**
 * SettingsManager統合テスト
 * ConfigurationManagerとの統合機能をテスト
 */

import { SettingsManager } from '../../src/core/SettingsManager.js';
import { getConfigurationManager } from '../../src/core/ConfigurationManager.js';

// 簡単なモック関数
const mockFn = (returnValue) => {
    const fn = (...args) => {
        fn.calls.push(args);
        return returnValue;
    };
    fn.calls = [];
    fn.mockReturnValue = (value) => { returnValue = value; return fn; };
    fn.mockImplementation = (impl) => { 
        const newFn = (...args) => {
            newFn.calls.push(args);
            return impl(...args);
        };
        newFn.calls = fn.calls;
        return newFn;
    };
    fn.mockClear = () => { fn.calls = []; return fn; };
    return fn;
};

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
    // document.bodyが存在することを確認
    if (!document.body) {
        document.body = document.createElement('body');
    }
});

describe('SettingsManager統合テスト', () => {
    let settingsManager;
    let mockGameEngine;
    let configManager;

    beforeEach(() => {
        // LocalStorageをクリア
        localStorage.clear();
        
        // モックゲームエンジンを作成
        mockGameEngine = new MockGameEngine();
        
        // ConfigurationManagerのインスタンスを取得
        configManager = getConfigurationManager();
        
        // SettingsManagerを作成
        settingsManager = new SettingsManager(mockGameEngine);
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

    describe('ConfigurationManagerとの統合', () => {
        test('ConfigurationManagerが正しく初期化される', () => {
            expect(settingsManager.configManager).toBeDefined();
            expect(settingsManager.configManager).toBe(configManager);
        });

        test('デフォルト値がConfigurationManagerに設定される', () => {
            // 音響設定のデフォルト値をチェック
            expect(configManager.get('audio', 'masterVolume')).toBe(0.7);
            expect(configManager.get('audio', 'sfxVolume')).toBe(0.8);
            expect(configManager.get('audio', 'bgmVolume')).toBe(0.5);

            // UI設定のデフォルト値をチェック
            expect(configManager.get('ui', 'language')).toBe('en'); // システム言語に依存
            expect(configManager.get('ui', 'quality')).toBe('auto');
        });

        test('検証ルールがConfigurationManagerに設定される', () => {
            // 無効な値を設定しようとした場合、ConfigurationManagerが拒否する
            const result = configManager.set('audio', 'masterVolume', 2.0); // 範囲外
            expect(result).toBe(false);

            const result2 = configManager.set('ui', 'language', 'invalid'); // 無効な言語
            expect(result2).toBe(false);
        });
    });

    describe('設定の取得と設定', () => {
        test('ConfigurationManagerから設定値を取得できる', () => {
            // ConfigurationManagerに直接設定
            configManager.set('audio', 'masterVolume', 0.5);
            
            // SettingsManagerから取得
            expect(settingsManager.get('masterVolume')).toBe(0.5);
        });

        test('SettingsManagerで設定した値がConfigurationManagerに反映される', () => {
            // SettingsManagerで設定
            const result = settingsManager.set('masterVolume', 0.6);
            expect(result).toBe(true);
            
            // ConfigurationManagerから確認
            expect(configManager.get('audio', 'masterVolume')).toBe(0.6);
        });

        test('ネストされた設定が正しく処理される', () => {
            // アクセシビリティ設定
            settingsManager.set('accessibility.highContrast', true);
            expect(configManager.get('accessibility', 'highContrast')).toBe(true);
            expect(settingsManager.get('accessibility.highContrast')).toBe(true);

            // UI設定
            settingsManager.set('ui.showFPS', true);
            expect(configManager.get('ui', 'showFPS')).toBe(true);
            expect(settingsManager.get('ui.showFPS')).toBe(true);
        });
    });

    describe('設定の永続化', () => {
        test('設定がlocalStorageに保存される', () => {
            // 設定を変更
            settingsManager.set('masterVolume', 0.8);
            settingsManager.set('language', 'ja');
            
            // 保存を実行
            settingsManager.save();
            
            // localStorageに保存されていることを確認
            const savedSettings = localStorage.getItem('bubblePop_settings');
            expect(savedSettings).toBeTruthy();
            
            const savedConfig = localStorage.getItem('bubblePop_configManager');
            expect(savedConfig).toBeTruthy();
            
            const parsedConfig = JSON.parse(savedConfig);
            expect(parsedConfig.audio.masterVolume).toBe(0.8);
            expect(parsedConfig.ui.language).toBe('ja');
        });

        test('保存された設定が正しく読み込まれる', () => {
            // 設定を保存
            settingsManager.set('masterVolume', 0.9);
            settingsManager.set('accessibility.highContrast', true);
            settingsManager.save();
            
            // 新しいインスタンスを作成
            const newSettingsManager = new SettingsManager(mockGameEngine);
            
            // 設定が復元されることを確認
            expect(newSettingsManager.get('masterVolume')).toBe(0.9);
            expect(newSettingsManager.get('accessibility.highContrast')).toBe(true);
            
            // ConfigurationManagerにも反映されることを確認
            expect(configManager.get('audio', 'masterVolume')).toBe(0.9);
            expect(configManager.get('accessibility', 'highContrast')).toBe(true);
            
            newSettingsManager.cleanup();
        });

        test('破損したデータがある場合でもデフォルト値で動作する', () => {
            // 破損したデータを設定
            localStorage.setItem('bubblePop_settings', 'invalid json');
            localStorage.setItem('bubblePop_configManager', 'invalid json');
            
            // 新しいインスタンスを作成
            const newSettingsManager = new SettingsManager(mockGameEngine);
            
            // デフォルト値が使用されることを確認
            expect(newSettingsManager.get('masterVolume')).toBe(0.7);
            expect(newSettingsManager.get('language')).toBe('en');
            
            newSettingsManager.cleanup();
        });
    });

    describe('設定変更の監視', () => {
        test('リスナーが正しく動作する', () => {
            const callback = mockFn();
            
            // リスナーを追加
            settingsManager.addListener('masterVolume', callback);
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.5);
            
            // コールバックが呼ばれることを確認
            expect(callback.calls.length).toBeGreaterThan(0);
        });

        test('ConfigurationManagerの監視機能も使用される', () => {
            const callback = mockFn();
            
            // リスナーを追加
            settingsManager.addListener('masterVolume', callback);
            
            // ConfigurationManagerから直接変更
            configManager.set('audio', 'masterVolume', 0.3);
            
            // コールバックが呼ばれることを確認
            expect(callback.calls.length).toBeGreaterThan(0);
        });

        test('リスナーが正しく削除される', () => {
            const callback = mockFn();
            
            // リスナーを追加
            settingsManager.addListener('masterVolume', callback);
            
            // リスナーを削除
            settingsManager.removeListener('masterVolume', callback);
            
            // 設定を変更
            settingsManager.set('masterVolume', 0.4);
            
            // コールバックが呼ばれないことを確認
            expect(callback.calls.length).toBe(0);
        });
    });

    describe('設定のリセット', () => {
        test('特定の設定をリセットできる', () => {
            // 設定を変更
            settingsManager.set('masterVolume', 0.2);
            expect(settingsManager.get('masterVolume')).toBe(0.2);
            
            // リセット
            settingsManager.reset('masterVolume');
            
            // デフォルト値に戻ることを確認
            expect(settingsManager.get('masterVolume')).toBe(0.7);
        });

        test('全設定をリセットできる', () => {
            // 複数の設定を変更
            settingsManager.set('masterVolume', 0.1);
            settingsManager.set('language', 'ja');
            settingsManager.set('accessibility.highContrast', true);
            
            // 全リセット
            settingsManager.reset();
            
            // 全てデフォルト値に戻ることを確認
            expect(settingsManager.get('masterVolume')).toBe(0.7);
            expect(settingsManager.get('language')).toBe('en');
            expect(settingsManager.get('accessibility.highContrast')).toBe(false);
        });
    });

    describe('統合状態の管理', () => {
        test('統合状態を取得できる', () => {
            const status = settingsManager.getIntegrationStatus();
            
            expect(status.configManagerActive).toBe(true);
            expect(status.watchersCount).toBe(0);
            expect(status.categoriesInConfig).toHaveLength(5);
            expect(status.legacySettingsCount).toBeGreaterThan(0);
        });

        test('同期状態をチェックできる', () => {
            // 設定を変更
            settingsManager.set('masterVolume', 0.5);
            
            const syncStatus = settingsManager.checkSyncStatus();
            expect(syncStatus.synchronized).toBe(true);
            expect(syncStatus.differences).toHaveLength(0);
        });

        test('強制同期が動作する', () => {
            // ConfigurationManagerに直接設定
            configManager.set('audio', 'masterVolume', 0.3);
            
            // 同期前は差異がある可能性
            const beforeSync = settingsManager.checkSyncStatus();
            
            // 強制同期
            const result = settingsManager.forceSynchronization();
            expect(result).toBe(true);
            
            // 同期後は一致する
            const afterSync = settingsManager.checkSyncStatus();
            expect(afterSync.synchronized).toBe(true);
        });
    });

    describe('エラーハンドリング', () => {
        test('無効な設定キーでもエラーにならない', () => {
            expect(() => {
                settingsManager.get('nonexistent.key');
            }).not.toThrow();
            
            expect(() => {
                settingsManager.set('nonexistent.key', 'value');
            }).not.toThrow();
        });

        test('無効な値を設定しようとした場合の処理', () => {
            // 範囲外の値
            const result = settingsManager.set('masterVolume', 2.0);
            expect(result).toBe(false);
            
            // 元の値が保持される
            expect(settingsManager.get('masterVolume')).toBe(0.7);
        });

        test('localStorageエラー時の処理', () => {
            // localStorageを無効化
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = mockFn(() => {
                throw new Error('Storage error');
            });
            
            // エラーが発生してもクラッシュしない
            expect(() => {
                settingsManager.save();
            }).not.toThrow();
            
            // 復元
            localStorage.setItem = originalSetItem;
        });
    });

    describe('ゲームエンジンとの連携', () => {
        test('音量設定がAudioManagerに反映される', () => {
            settingsManager.set('masterVolume', 0.5);
            
            expect(mockGameEngine.audioManager.setVolume.calls.length).toBeGreaterThan(0);
        });

        test('言語設定がLocalizationManagerに反映される', () => {
            settingsManager.set('language', 'ja');
            
            expect(mockGameEngine.localizationManager.setLanguage.calls.length).toBeGreaterThan(0);
        });

        test('品質設定がPerformanceOptimizerに反映される', () => {
            settingsManager.set('quality', 'high');
            
            expect(mockGameEngine.performanceOptimizer.setQualityLevel.calls.length).toBeGreaterThan(0);
        });

        test('アクセシビリティ設定がDOMに反映される', () => {
            // ハイコントラストモード
            settingsManager.set('accessibility.highContrast', true);
            
            expect(document.body.classList.contains('high-contrast')).toBe(true);
            
            // 無効化
            settingsManager.set('accessibility.highContrast', false);
            
            expect(document.body.classList.contains('high-contrast')).toBe(false);
        });
    });
});