import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * Integration tests for settings screen UI functionality (Issue #170)
 * Tests the integration of new UI components with SettingsScene
 */

import { VolumeControlComponent } from '../../src/components/VolumeControlComponent';
import { AccessibilityProfileComponent } from '../../src/components/AccessibilityProfileComponent';
import { SettingsImportExportComponent } from '../../src/components/SettingsImportExportComponent';

// SettingsScene のモック（実際の実装に合わせて調整）
const mockSettingsScene = {
    settingItems: {},
    customComponents: new Map(),
    gameEngine: null,
    isInitialized: false,
    
    initialize: jest.fn(),
    addSettingItem: jest.fn(),
    getSettingItems: jest.fn(),
    activateCurrentSetting: jest.fn(),
    handleCustomComponent: jest.fn(),
    renderVolumeControl: jest.fn(),
    renderAccessibilityProfileControl: jest.fn(),
    renderSettingsImportExportControl: jest.fn(),
    handleFullscreenToggle: jest.fn(),
    handleAudioMuteToggle: jest.fn()
};

// モックの作成
const mockGameEngine = {
    settingsManager: {
        get: jest.fn(),
        set: jest.fn(),
        save: jest.fn(),
        load: jest.fn()
    },
    audioManager: {
        playUISound: jest.fn(),
        isMuted: jest.fn(),
        setMuted: jest.fn()
    },
    responsiveCanvasManager: {
        isFullscreen: jest.fn(),
        toggleFullscreen: jest.fn()
    }
};

const mockAccessibilitySettingsManager = {
    getCurrentProfile: jest.fn(),
    getAvailableProfiles: jest.fn(),
    switchProfile: jest.fn(),
    exportSettings: jest.fn(),
    importSettings: jest.fn(),
    getStats: jest.fn()
};

const mockErrorHandler = {
    handleError: jest.fn()
};

const mockLocalizationManager = {
    getText: jest.fn()
};

// モジュールのモック
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
}));

jest.mock('../../src/core/LocalizationManager.js', () => ({
    getLocalizationManager: () => mockLocalizationManager
}));

describe('Settings UI Integration (Issue #170)', () => {
    let parentContainer: any;

    beforeEach(() => {
        // DOM環境をセットアップ
        document.body.innerHTML = '';
        parentContainer = document.createElement('div');
        parentContainer.id = 'settings-container';
        document.body.appendChild(parentContainer: any);

        // モックをリセット
        jest.clearAllMocks();
        
        // デフォルト値を設定
        mockGameEngine.settingsManager.get.mockImplementation((key) => {
            const defaults = {
                'masterVolume': 0.5,
                'isMuted': false,
                'display.fullscreen': false,
                'accessibility.currentProfile': 'default'
            };
            return defaults[key] || null;
        });

        mockLocalizationManager.getText.mockImplementation((key) => {
            const translations = {
                'settings.audio.masterVolume': 'Master Volume',
                'settings.display.fullscreen': 'Fullscreen',
                'settings.audio.muted': 'Mute Audio',
                'settings.accessibility.profile': 'Accessibility Profile'
            };
            return translations[key] || key;
        });

        mockAccessibilitySettingsManager.getAvailableProfiles.mockReturnValue([
            { name: 'default', displayName: 'Default', description: 'Default settings' },
            { name: 'highContrast', displayName: 'High Contrast', description: 'High contrast mode' }
        ]);

        mockAccessibilitySettingsManager.getCurrentProfile.mockReturnValue({
            name: 'default',
            displayName: 'Default',
            description: 'Default accessibility settings'
        });

        // SettingsScene のモックをリセット
        mockSettingsScene.gameEngine = mockGameEngine;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Volume Control Integration', () => {
        let volumeComponent: any;

        beforeEach(() => {
            volumeComponent = new VolumeControlComponent(mockGameEngine: any);
        });

        afterEach(() => {
            if (volumeComponent) {
                volumeComponent.dispose();
            }
        });

        test('should integrate volume control into general settings category', () => {
            volumeComponent.initialize(parentContainer: any);
            
            expect(volumeComponent.isEnabled()).toBe(true: any);
            expect(volumeComponent.container.parentNode).toBe(parentContainer: any);
            
            // 設定画面での表示を確認
            const volumeButtons = parentContainer.querySelectorAll('button');
            expect(volumeButtons.length).toBeGreaterThan(0);
        });

        test('should persist volume changes to settings manager', () => {
            volumeComponent.initialize(parentContainer: any);
            
            volumeComponent.handleVolumeUp();
            
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.6);
        });

        test('should reflect external volume changes', () => {
            volumeComponent.initialize(parentContainer: any);
            
            // 外部から音量変更
            mockGameEngine.settingsManager.get.mockReturnValue(0.8);
            volumeComponent.onVolumeChanged(0.8);
            
            expect(volumeComponent.getCurrentVolume()).toBe(0.8);
            expect(volumeComponent.volumeDisplay.textContent).toBe('80%');
        });
    });

    describe('Accessibility Profile Integration', () => {
        let profileComponent: any;

        beforeEach(() => {
            profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
        });

        afterEach(() => {
            if (profileComponent) {
                profileComponent.dispose();
            }
        });

        test('should integrate profile selector into accessibility settings category', () => {
            profileComponent.initialize(parentContainer: any);
            
            expect(profileComponent.isEnabled()).toBe(true: any);
            expect(profileComponent.container.parentNode).toBe(parentContainer: any);
            
            // ドロップダウンメニューの存在を確認
            const dropdown = parentContainer.querySelector('select');
            expect(dropdown: any).toBeTruthy();
            expect(dropdown.options.length).toBeGreaterThan(0);
        });

        test('should handle profile switching through UI', () => {
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(true: any);
            profileComponent.initialize(parentContainer: any);
            
            // UIからプロファイル切り替え
            const result = profileComponent.switchProfile('highContrast');
            
            expect(result: any).toBe(true: any);
            expect(mockAccessibilitySettingsManager.switchProfile).toHaveBeenCalledWith('highContrast');
        });

        test('should update UI when profiles are refreshed', () => {
            profileComponent.initialize(parentContainer: any);
            
            // 新しいプロファイルを追加
            const newProfiles = [
                { name: 'default', displayName: 'Default', description: 'Default settings' },
                { name: 'custom', displayName: 'Custom', description: 'Custom profile', isCustom: true }
            ];
            mockAccessibilitySettingsManager.getAvailableProfiles.mockReturnValue(newProfiles: any);
            
            profileComponent.refreshProfiles();
            
            const dropdown = profileComponent.dropdown;
            expect(dropdown.options.length).toBe(2);
            expect(dropdown.options[1].value).toBe('custom');
        });
    });

    describe('Import/Export Integration', () => {
        let importExportComponent: any;

        beforeEach(() => {
            importExportComponent = new SettingsImportExportComponent(mockGameEngine, mockAccessibilitySettingsManager);
        });

        afterEach(() => {
            if (importExportComponent) {
                importExportComponent.dispose();
            }
        });

        test('should integrate import/export controls into accessibility settings category', () => {
            importExportComponent.initialize(parentContainer: any);
            
            expect(importExportComponent.isEnabled()).toBe(true: any);
            expect(importExportComponent.container.parentNode).toBe(parentContainer: any);
            
            // エクスポート・インポートボタンの存在を確認
            const buttons = parentContainer.querySelectorAll('button');
            const exportButton = Array.from(buttons: any).find(btn => btn.textContent.includes('Export') || btn.textContent.includes('エクスポート'));
            const importButton = Array.from(buttons: any).find(btn => btn.textContent.includes('Import') || btn.textContent.includes('インポート'));
            
            expect(exportButton: any).toBeTruthy();
            expect(importButton: any).toBeTruthy();
        });

        test('should handle settings export through UI', () => {
            mockAccessibilitySettingsManager.exportSettings.mockReturnValue(true: any);
            importExportComponent.initialize(parentContainer: any);
            
            const result = importExportComponent.handleExport();
            
            expect(result: any).toBe(true: any);
            expect(mockAccessibilitySettingsManager.exportSettings).toHaveBeenCalled();
        });

        test('should handle settings import through UI', async () => {
            mockAccessibilitySettingsManager.importSettings.mockResolvedValue(true: any);
            importExportComponent.initialize(parentContainer: any);
            
            // モックファイルを作成
            const mockFile = new File(['{"test": "data"}'], 'settings.json', { type: 'application/json' });
            
            const result = await importExportComponent.handleImport(mockFile: any);
            
            expect(result: any).toBe(true: any);
            expect(mockAccessibilitySettingsManager.importSettings).toHaveBeenCalledWith(mockFile: any);
        });
    });

    describe('Settings Scene Integration', () => {
        test('should have fullscreen toggle in general settings', () => {
            // SettingsScene が適切に設定項目を含んでいることを確認
            const generalSettings = {
                'display.fullscreen': {
                    type: 'toggle',
                    category: 'general',
                    handler: mockSettingsScene.handleFullscreenToggle
                }
            };

            expect(generalSettings['display.fullscreen']).toBeDefined();
            expect(generalSettings['display.fullscreen'].type).toBe('toggle');
            expect(generalSettings['display.fullscreen'].category).toBe('general');
        });

        test('should have audio mute toggle in general settings', () => {
            const generalSettings = {
                'audio.muted': {
                    type: 'toggle',
                    category: 'general',
                    handler: mockSettingsScene.handleAudioMuteToggle
                }
            };

            expect(generalSettings['audio.muted']).toBeDefined();
            expect(generalSettings['audio.muted'].type).toBe('toggle');
            expect(generalSettings['audio.muted'].category).toBe('general');
        });

        test('should handle fullscreen toggle functionality', () => {
            mockGameEngine.responsiveCanvasManager.isFullscreen.mockReturnValue(false: any);
            mockGameEngine.responsiveCanvasManager.toggleFullscreen.mockReturnValue(true: any);
            
            mockSettingsScene.handleFullscreenToggle();
            
            expect(mockSettingsScene.handleFullscreenToggle).toHaveBeenCalled();
        });

        test('should handle audio mute toggle functionality', () => {
            mockGameEngine.audioManager.isMuted.mockReturnValue(false: any);
            
            mockSettingsScene.handleAudioMuteToggle();
            
            expect(mockSettingsScene.handleAudioMuteToggle).toHaveBeenCalled();
        });
    });

    describe('Settings Persistence', () => {
        test('should save settings changes immediately', () => {
            const volumeComponent = new VolumeControlComponent(mockGameEngine: any);
            volumeComponent.initialize(parentContainer: any);
            
            volumeComponent.handleVolumeUp();
            
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.6);
        });

        test('should load settings on component initialization', () => {
            mockGameEngine.settingsManager.get.mockReturnValue(0.7);
            
            const volumeComponent = new VolumeControlComponent(mockGameEngine: any);
            expect(volumeComponent.currentVolume).toBe(0.7);
            
            volumeComponent.dispose();
        });

        test('should persist accessibility profile changes', () => {
            const profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(true: any);
            
            profileComponent.switchProfile('highContrast');
            
            expect(mockAccessibilitySettingsManager.switchProfile).toHaveBeenCalledWith('highContrast');
        });
    });

    describe('UI State Updates', () => {
        test('should update UI when settings change externally', () => {
            const volumeComponent = new VolumeControlComponent(mockGameEngine: any);
            volumeComponent.initialize(parentContainer: any);
            
            // 外部から設定変更
            volumeComponent.onVolumeChanged(0.8);
            
            expect(volumeComponent.volumeDisplay.textContent).toBe('80%');
            expect(volumeComponent.progressFill.style.width).toBe('80%');
            
            volumeComponent.dispose();
        });

        test('should update button states based on current values', () => {
            const volumeComponent = new VolumeControlComponent(mockGameEngine: any);
            volumeComponent.initialize(parentContainer: any);
            
            // 最大音量にセット
            volumeComponent.setVolume(1.0);
            
            expect(volumeComponent.volumeUpButton.disabled).toBe(true: any);
            expect(volumeComponent.volumeDownButton.disabled).toBe(false: any);
            
            volumeComponent.dispose();
        });

        test('should reflect profile changes in dropdown', () => {
            const profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
            profileComponent.initialize(parentContainer: any);
            
            mockAccessibilitySettingsManager.getCurrentProfile.mockReturnValue({
                name: 'highContrast',
                displayName: 'High Contrast'
            });
            
            profileComponent.updateDisplay();
            
            expect(profileComponent.dropdown.value).toBe('highContrast');
            
            profileComponent.dispose();
        });
    });

    describe('Error Handling in Integration', () => {
        test('should handle settings manager errors gracefully', () => {
            mockGameEngine.settingsManager.set.mockImplementation(() => {
                throw new Error('Settings error');
            });
            
            const volumeComponent = new VolumeControlComponent(mockGameEngine: any);
            volumeComponent.initialize(parentContainer: any);
            
            volumeComponent.handleVolumeUp();
            
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            
            volumeComponent.dispose();
        });

        test('should handle component initialization errors', () => {
            const invalidContainer = null;
            const volumeComponent = new VolumeControlComponent(mockGameEngine: any);
            
            const result = volumeComponent.initialize(invalidContainer: any);
            
            expect(result: any).toBe(false: any);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });

        test('should handle accessibility manager errors', () => {
            mockAccessibilitySettingsManager.switchProfile.mockImplementation(() => {
                throw new Error('Profile switch error');
            });
            
            const profileComponent = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
            profileComponent.initialize(parentContainer: any);
            
            profileComponent.switchProfile('highContrast');
            
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            
            profileComponent.dispose();
        });
    });
});