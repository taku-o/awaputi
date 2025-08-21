import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * Tests for settings persistence (Issue #170 - Task 7.5')'
 * Verifies that settings changes through UI are properly persisted and restored
 */
import { VolumeControlComponent } from '../../src/components/VolumeControlComponent';
import { AccessibilityProfileComponent } from '../../src/components/AccessibilityProfileComponent';
import { SettingsImportExportComponent } from '../../src/components/SettingsImportExportComponent';
// LocalStorage のモック
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString()),
        removeItem: jest.fn((key) => {
            delete store[key]),
        clear: jest.fn(() => {
            store = {)) };
})(');'
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,);
// モックの作成
const mockGameEngine = {
    settingsManager: {
        get: jest.fn(
        set: jest.fn(
        save: jest.fn(
        load: jest.fn(
        getDefaultValue: jest.fn( },
    audioManager: {
        playUISound: jest.fn( }
};
const mockAccessibilitySettingsManager = {
    getCurrentProfile: jest.fn(
    getAvailableProfiles: jest.fn(
    switchProfile: jest.fn(
    exportSettings: jest.fn(
    importSettings: jest.fn(
        getStats: jest.fn( };
const mockErrorHandler = {
    handleError: jest.fn( };
const mockLocalizationManager = {
    getText: jest.fn()' };'
// モジュールのモック
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
})');'
jest.mock('../../src/core/LocalizationManager.js', () => ({
    getLocalizationManager: () => mockLocalizationManager
})');'
describe('Settings Persistence (Issue #170')', () => {'
    let parentContainer: any,
    beforeEach((') => {'
        // DOM環境をセットアップ
        document.body.innerHTML = ','
        parentContainer = document.createElement('div'),
        document.body.appendChild(parentContainer),
        // LocalStorage をクリア
        localStorageMock.clear(),
        // モックをリセット
        jest.clearAllMocks(),
        // デフォルト翻訳を設定
        mockLocalizationManager.getText.mockImplementation((key') => {'
            const translations = {
                'settings.audio.masterVolume': 'Master Volume',
                'settings.accessibility.profile': 'Accessibility Profile'
            };
            return translations[key] || key;
        });
        // デフォルト設定を模倣
        mockGameEngine.settingsManager.getDefaultValue.mockImplementation((key') => {'
            const defaults = {
                'masterVolume': 0.5,
                'accessibility.currentProfile': 'default'
            };
            return defaults[key];
        });
    }
    afterEach((') => {'
        document.body.innerHTML = ' }');
    describe('Volume Settings Persistence', (') => {'
        test('should save volume changes to localStorage through SettingsManager', () => {
            // 初期音量を設定
            mockGameEngine.settingsManager.get.mockReturnValue(0.5),
            const volumeComponent = new VolumeControlComponent(mockGameEngine),
            volumeComponent.initialize(parentContainer),
            // 音量を変更
            volumeComponent.handleVolumeUp(),
            // SettingsManager.set が呼ばれることを確認
            expect(mockGameEngine.settingsManager.set').toHaveBeenCalledWith('masterVolume', 0.6),'
            volumeComponent.dispose() }');'
        test('should restore volume settings on component initialization', () => {
            // 保存されている音量を模倣
            mockGameEngine.settingsManager.get.mockReturnValue(0.8),
            const volumeComponent = new VolumeControlComponent(mockGameEngine),
            // コンポーネント初期化時に保存された値が読み込まれることを確認
            expect(volumeComponent.currentVolume).toBe(0.8),
            expect(mockGameEngine.settingsManager.get').toHaveBeenCalledWith('masterVolume'),'
            volumeComponent.dispose() }');'
        test('should handle volume settings persistence failure gracefully', () => {
            mockGameEngine.settingsManager.set.mockImplementation((') => {'
                throw new Error('Storage error') });
            const volumeComponent = new VolumeControlComponent(mockGameEngine);
            volumeComponent.initialize(parentContainer);
            // エラーが発生してもコンポーネントは動作継続
            volumeComponent.handleVolumeUp();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            expect(volumeComponent.currentVolume).toBe(0.6); // ローカルには反映される
            
            volumeComponent.dispose();
        }');'
        test('should fallback to default when stored volume is invalid', () => {
            // 無効な値を返すように設定
            mockGameEngine.settingsManager.get.mockReturnValue(null),
            mockGameEngine.settingsManager.getDefaultValue.mockReturnValue(0.5),
            const volumeComponent = new VolumeControlComponent(mockGameEngine),
            // デフォルト値にフォールバック
            expect(volumeComponent.currentVolume).toBe(0.5),
            volumeComponent.dispose() }');'
    }
    describe('Accessibility Profile Persistence', (') => {'
        test('should persist profile changes through AccessibilitySettingsManager', (') => {'
            // 初期プロファイルを設定
            mockAccessibilitySettingsManager.getCurrentProfile.mockReturnValue({
                name: 'default',
                displayName: 'Default' }');'
            mockAccessibilitySettingsManager.getAvailableProfiles.mockReturnValue([
                { name: 'default', displayName: 'Default' },
                { name: 'highContrast', displayName: 'High Contrast'
            });
            ]);
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(true);
            const profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
            profileComponent.initialize(parentContainer');'
            // プロファイルを切り替え
            profileComponent.switchProfile('highContrast');
            // AccessibilitySettingsManager.switchProfile が呼ばれることを確認
            expect(mockAccessibilitySettingsManager.switchProfile').toHaveBeenCalledWith('highContrast');'
            profileComponent.dispose();
        }');'
        test('should restore profile settings on component initialization', (') => {'
            // 保存されているプロファイルを模倣
            mockAccessibilitySettingsManager.getCurrentProfile.mockReturnValue({
                name: 'highContrast',
                displayName: 'High Contrast' }');'
            mockAccessibilitySettingsManager.getAvailableProfiles.mockReturnValue([
                { name: 'default', displayName: 'Default' },
                { name: 'highContrast', displayName: 'High Contrast'
            });
            ]);
            const profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
            profileComponent.initialize(parentContainer);
            // 初期化時に現在のプロファイルが読み込まれることを確認
            expect(mockAccessibilitySettingsManager.getCurrentProfile).toHaveBeenCalled();
            expect(profileComponent.currentProfile').toBe('highContrast');'
            profileComponent.dispose();
        }');'
        test('should handle profile persistence failure gracefully', () => {
            mockAccessibilitySettingsManager.switchProfile.mockImplementation((') => {'
                throw new Error('Profile storage error') });
            const profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
            profileComponent.initialize(parentContainer');'
            // エラーが発生してもコンポーネントは動作継続
            profileComponent.switchProfile('highContrast');
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            profileComponent.dispose();
        }');'
    }
    describe('Settings Export/Import', (') => {'
        test('should export settings with current values', (') => {'
            // 現在の設定状態を模倣
            const mockExportData = {
                timestamp: '2025-01-14T12:00:00.000Z',
                version: '1.0.0',
                settings: {
                    'masterVolume': 0.7,
                    'accessibility.currentProfile': 'highContrast'
                }
            };
            
            mockAccessibilitySettingsManager.exportSettings.mockReturnValue(true);
            mockAccessibilitySettingsManager.getStats.mockReturnValue({
                exportCount: 1),
            const importExportComponent = new SettingsImportExportComponent(mockGameEngine, mockAccessibilitySettingsManager),
            importExportComponent.initialize(parentContainer),
            // エクスポート実行
            const result = importExportComponent.handleExport(),
            expect(result.toBe(true),
            expect(mockAccessibilitySettingsManager.exportSettings).toHaveBeenCalled(),
            importExportComponent.dispose() }');'
        test('should import and apply settings correctly', async (') => {'
            const mockImportData = {
                timestamp: '2025-01-14T12:00:00.000Z',
                version: '1.0.0',
                settings: {
                    'masterVolume': 0.8,
                    'accessibility.currentProfile': 'highContrast'
                }
            };
            
            mockAccessibilitySettingsManager.importSettings.mockResolvedValue(true);
            const importExportComponent = new SettingsImportExportComponent(mockGameEngine, mockAccessibilitySettingsManager);
            importExportComponent.initialize(parentContainer');'
            // モックファイルを作成
            const mockFile = new File([JSON.stringify(mockImportData], 'settings.json', { type: 'application/json' ),
            // インポート実行
            const result = await importExportComponent.handleImport(mockFile),
            expect(result.toBe(true),
            expect(mockAccessibilitySettingsManager.importSettings).toHaveBeenCalledWith(mockFile),
            importExportComponent.dispose() }');'
        test('should handle malformed import files gracefully', async (') => {'
            mockAccessibilitySettingsManager.importSettings.mockRejectedValue(new Error('Invalid file format'),
            const importExportComponent = new SettingsImportExportComponent(mockGameEngine, mockAccessibilitySettingsManager),
            importExportComponent.initialize(parentContainer'),'
            // 無効なファイルを作成
            const invalidFile = new File(['invalid json'], 'invalid.json', { type: 'application/json' ,
            // インポート実行（エラーを期待）
            const result = await importExportComponent.handleImport(invalidFile),
            expect(result.toBe(false),
            expect(mockErrorHandler.handleError).toHaveBeenCalled(),
            importExportComponent.dispose() }');'
        test('should include relevant settings in export', (') => {'
            const mockSettings = {
                'masterVolume': 0.6,
                'audio.muted': false,
                'display.fullscreen': true,
                'accessibility.highContrast': true,
                'accessibility.largeText': false,
                'accessibility.reducedMotion': true,
                'accessibility.currentProfile': 'highContrast'
            };
            
            // エクスポートデータに全ての関連設定が含まれることを確認
            mockAccessibilitySettingsManager.exportSettings.mockImplementation((format, includeProfiles) => {
                // エクスポート処理のシミュレーション
                const exportData = {
                    timestamp: new Date().toISOString(),
                    settings: mockSettings,;
                
                if (includeProfiles') {'
                    exportData.profiles = {
                        'highContrast': { name: 'High Contrast', settings: {} }
                    };
                }
                
                return true;
            });
            const importExportComponent = new SettingsImportExportComponent(mockGameEngine, mockAccessibilitySettingsManager);
            importExportComponent.initialize(parentContainer);
            const result = importExportComponent.handleExport();
            expect(result.toBe(true);
            importExportComponent.dispose();
        }');'
    }
    describe('Settings Persistence Across Game Sessions', (') => {'
        test('should maintain settings after game restart simulation', () => {
            // 第1セッション: 設定を変更
            mockGameEngine.settingsManager.get.mockReturnValue(0.5),
            const volumeComponent1 = new VolumeControlComponent(mockGameEngine),
            volumeComponent1.initialize(parentContainer),
            volumeComponent1.handleVolumeUp(),
            expect(mockGameEngine.settingsManager.set').toHaveBeenCalledWith('masterVolume', 0.6),'
            volumeComponent1.dispose(),
            // ゲーム再起動をシミュレート（新しいコンポーネントインスタンス）
            mockGameEngine.settingsManager.get.mockReturnValue(0.6), // 保存された値
            
            const volumeComponent2 = new VolumeControlComponent(mockGameEngine),
            // 設定が保持されていることを確認
            expect(volumeComponent2.currentVolume).toBe(0.6),
            volumeComponent2.dispose() }');'
        test('should handle localStorage quota exceeded gracefully', () => {
            // localStorage の容量制限をシミュレート
            mockGameEngine.settingsManager.set.mockImplementation((') => {'
                throw new Error('QuotaExceededError') });
            const volumeComponent = new VolumeControlComponent(mockGameEngine);
            volumeComponent.initialize(parentContainer);
            // エラーが発生してもアプリケーションは動作継続
            volumeComponent.handleVolumeUp();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            volumeComponent.dispose();
        }');'
    }
    describe('Settings Fallback and Recovery', (') => {'
        test('should fallback to defaults when settings fail to load', () => {
            // 設定読み込みエラーをシミュレート
            mockGameEngine.settingsManager.get.mockImplementation((') => {'
                throw new Error('Settings load error') });
            mockGameEngine.settingsManager.getDefaultValue.mockReturnValue(0.5);
            const volumeComponent = new VolumeControlComponent(mockGameEngine);
            // デフォルト値にフォールバック
            expect(volumeComponent.currentVolume).toBe(0.5);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            volumeComponent.dispose();
        }');'
        test('should recover from corrupted settings data', (') => {'
            // 破損したデータをシミュレート
            mockGameEngine.settingsManager.get.mockReturnValue('corrupted_data'),
            mockGameEngine.settingsManager.getDefaultValue.mockReturnValue(0.5),
            const volumeComponent = new VolumeControlComponent(mockGameEngine),
            // 無効なデータの場合はデフォルト値を使用
            expect(volumeComponent.currentVolume).toBe(0.5),
            volumeComponent.dispose() }');'
        test('should validate imported settings data', async (') => {'
            // 無効なデータ構造をシミュレート
            const invalidImportData = {
                // timestamp が不正
                timestamp: 'invalid-date',
                settings: {
                    'masterVolume': 'invalid-volume', // 数値でない
                    'accessibility.currentProfile': null // 不正な値
                }
            };
            
            mockAccessibilitySettingsManager.importSettings.mockRejectedValue(new Error('Invalid settings data');
            const importExportComponent = new SettingsImportExportComponent(mockGameEngine, mockAccessibilitySettingsManager);
            importExportComponent.initialize(parentContainer');'
            const invalidFile = new File([JSON.stringify(invalidImportData], 'invalid.json', { type: 'application/json' ),
            const result = await importExportComponent.handleImport(invalidFile),
            expect(result.toBe(false),
            expect(mockErrorHandler.handleError).toHaveBeenCalled(),
            importExportComponent.dispose() });
    }
}');'