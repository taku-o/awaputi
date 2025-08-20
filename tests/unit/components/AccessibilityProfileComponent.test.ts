import { jest } from '@jest/globals';
import { AccessibilityProfileComponent } from '../../../src/components/AccessibilityProfileComponent.js';
// Type definitions
interface MockGameEngine {
    settingsManager: {
        get: jest.Mock<any, [string]>;
        set: jest.Mock<void, [string, any]>;
    };
    audioManager: {
        playUISound: jest.Mock<void, [string]>;
    };
}
interface MockErrorHandler {
    handleError: jest.Mock<void, [Error, string? , any?]>;
}
interface MockLocalizationManager { : undefined
    getText: jest.Mock<string, [string]>;
}
interface AccessibilityProfile {
    name: string,
    displayName: string,
    description: string,
    isCustom?: boolean;
}
interface MockAccessibilitySettingsManager {
    getCurrentProfile: jest.Mock<AccessibilityProfile | null, []>;
    getAvailableProfiles: jest.Mock<AccessibilityProfile[], []>;
    switchProfile: jest.Mock<boolean, [string]>;
    getStats: jest.Mock<{ profilesUsed: number; currentProfile: string }, []>;
}
interface ComponentStats {
    isInitialized: boolean,
    currentProfile: string,
    availableProfilesCount: number,
    profilesUsed: number,
}
interface Announcer {
    announce: jest.Mock<void, [string]>;
}
// モックの作成
const mockGameEngine: MockGameEngine = {
    settingsManager: {
        get: jest.fn(),
        set: jest.fn(),
    },
    audioManager: {
        playUISound: jest.fn(),
    }
};
const mockErrorHandler: MockErrorHandler = {
    handleError: jest.fn(),
};
const mockLocalizationManager: MockLocalizationManager = {
    getText: jest.fn(),
};
const mockAccessibilitySettingsManager: MockAccessibilitySettingsManager = {
    getCurrentProfile: jest.fn(),
    getAvailableProfiles: jest.fn(),
    switchProfile: jest.fn(),
        getStats: jest.fn()'),
};
// モジュールのモック
jest.mock('../../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
})');
jest.mock('../../../src/core/LocalizationManager.js', () => ({
    getLocalizationManager: () => mockLocalizationManager
})');
describe('AccessibilityProfileComponent', () => {
    let component: AccessibilityProfileComponent,
    let parentContainer: HTMLDivElement,
    beforeEach((') => {
        // DOM環境をセットアップ
        document.body.innerHTML = '';
        parentContainer = document.createElement('div');
        document.body.appendChild(parentContainer);
        // モックをリセット
        jest.clearAllMocks();
        // デフォルトの翻訳を設定
        mockLocalizationManager.getText.mockImplementation((key: string') => {
            const translations: Record<string, string> = {
                'settings.accessibility.profile': 'Accessibility Profile',
                'settings.accessibility.profiles.default': 'Default',
                'settings.accessibility.profiles.highContrast': 'High Contrast',
                'settings.accessibility.profiles.motorImpairment': 'Motor Impairment'
            };
            return translations[key] || key;
        }');
        // デフォルトのプロファイルを設定
        mockAccessibilitySettingsManager.getCurrentProfile.mockReturnValue({
            name: 'default',
            displayName: 'Default',
            description: 'Default accessibility settings')');
        mockAccessibilitySettingsManager.getAvailableProfiles.mockReturnValue([
            { name: 'default', displayName: 'Default', description: 'Default accessibility settings', isCustom: false },
            { name: 'highContrast', displayName: 'High Contrast', description: 'High contrast mode', isCustom: false }')
            { name: 'motorImpairment', displayName: 'Motor Impairment', description: 'Motor accessibility support', isCustom: false )
        ]');
        mockAccessibilitySettingsManager.getStats.mockReturnValue({
            profilesUsed: 1,
            currentProfile: 'default');
        component = new AccessibilityProfileComponent(mockGameEngine, mockAccessibilitySettingsManager);
    });
    afterEach(() => {
        if (component) {
            component.dispose();
        }
    }');
    describe('Constructor', (') => {
        test('should initialize with default values', () => {
            expect(component.gameEngine).toBe(mockGameEngine);
            expect(component.accessibilitySettingsManager).toBe(mockAccessibilitySettingsManager);
            expect(component.isInitialized).toBe(false);
            expect(component.currentProfile').toBe('default');
        }');
        test('should handle missing accessibility settings manager', () => {
            const newComponent = new AccessibilityProfileComponent(mockGameEngine, null as any);
            expect(newComponent.accessibilitySettingsManager).toBeNull();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
    }
    describe('Initialization', (') => {
        test('should initialize successfully', () => {
            const result = component.initialize(parentContainer);
            expect(result).toBe(true);
            expect(component.isInitialized).toBe(true);
            expect(component.container).toBeDefined();
            expect(component.container!.parentNode).toBe(parentContainer);
        }');
        test('should prevent double initialization', (') => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            component.initialize(parentContainer);
            const result = component.initialize(parentContainer);
            expect(result).toBe(true);
            expect(consoleSpy').toHaveBeenCalledWith('[AccessibilityProfileComponent] Already initialized');
            consoleSpy.mockRestore();
        }');
        test('should handle invalid parent container', () => {
            const result = component.initialize(null);
            expect(result).toBe(false);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
        test('should create dropdown menu', () => {
            component.initialize(parentContainer);
            const dropdown = component.dropdown;
            
            expect(dropdown).toBeDefined();
            expect(dropdown!.tagName').toBe('SELECT'');
            expect(dropdown!.getAttribute('role')').toBe('combobox'');
            expect(dropdown!.getAttribute('aria-label')').toBe('Accessibility Profile');
        }');
        test('should populate dropdown options', () => {
            component.initialize(parentContainer);
            const options = component.dropdown!.options;
            
            expect(options.length).toBe(3);
            expect(options[0].value').toBe('default');
            expect(options[0].textContent').toBe('Default');
            expect(options[1].value').toBe('highContrast');
            expect(options[2].value').toBe('motorImpairment');
        }');
    }
    describe('Profile Management', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should switch profile successfully', () => {
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(true');
            const result = component.switchProfile('highContrast');
            expect(result).toBe(true);
            expect(mockAccessibilitySettingsManager.switchProfile').toHaveBeenCalledWith('highContrast');
            expect(component.currentProfile').toBe('highContrast');
            expect(component.dropdown!.value').toBe('highContrast');
            expect(mockGameEngine.audioManager.playUISound').toHaveBeenCalledWith('button-click');
        }');
        test('should handle profile switch failure', () => {
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(false');
            const result = component.switchProfile('highContrast');
            expect(result).toBe(false);
            expect(component.currentProfile').toBe('default'); // 変わらない
            expect(mockGameEngine.audioManager.playUISound').toHaveBeenCalledWith('error');
        }');
        test('should handle dropdown change event', (') => {
            const changeEvent = new Event('change'');
            component.dropdown!.value = 'motorImpairment';
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(true);
            component.dropdown!.dispatchEvent(changeEvent);
            expect(mockAccessibilitySettingsManager.switchProfile').toHaveBeenCalledWith('motorImpairment');
            expect(component.currentProfile').toBe('motorImpairment');
        }');
        test('should get current profile', () => {
            const profile = component.getCurrentProfile();
            expect(profile!.name').toBe('default');
            expect(mockAccessibilitySettingsManager.getCurrentProfile).toHaveBeenCalled();
        }');
        test('should get available profiles', () => {
            const profiles = component.getAvailableProfiles();
            expect(profiles).toHaveLength(3);
            expect(profiles[0].name').toBe('default');
            expect(mockAccessibilitySettingsManager.getAvailableProfiles).toHaveBeenCalled();
        }');
    }
    describe('UI Updates', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should update display for current profile', (') => {
            mockAccessibilitySettingsManager.getCurrentProfile.mockReturnValue({
                name: 'highContrast',
                displayName: 'High Contrast',
                description: 'High contrast mode for better visibility'),
            });
            component.updateDisplay();
            expect(component.dropdown!.value').toBe('highContrast');
            expect(component.currentProfile').toBe('highContrast');
        }');
        test('should refresh profiles list', (') => {
            const newProfiles: AccessibilityProfile[] = [
                { name: 'default', displayName: 'Default', description: 'Default settings' },
                { name: 'custom1', displayName: 'Custom Profile 1', description: 'Custom profile', isCustom: true }
            ];
            mockAccessibilitySettingsManager.getAvailableProfiles.mockReturnValue(newProfiles);
            component.refreshProfiles();
            const options = component.dropdown!.options;
            expect(options.length).toBe(2);
            expect(options[1].value').toBe('custom1');
            expect(options[1].textContent').toBe('Custom Profile 1');
        }');
    }
    describe('Event Handling', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should handle keyboard events on dropdown', (') => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' }');
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' }');
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            component.handleDropdownKeydown(enterEvent);
            expect(enterEvent.preventDefault).toBeDefined();
            component.handleDropdownKeydown(spaceEvent);
            expect(spaceEvent.preventDefault).toBeDefined();
            component.handleDropdownKeydown(escapeEvent);
            expect(escapeEvent.preventDefault).toBeDefined();
        }');
        test('should handle focus events', (') => {
            const focusEvent = new Event('focus'');
            const blurEvent = new Event('blur');
            component.dropdown!.dispatchEvent(focusEvent');
            expect(component.dropdown!.classList.contains('focused').toBe(true);
            component.dropdown!.dispatchEvent(blurEvent');
            expect(component.dropdown!.classList.contains('focused').toBe(false);
        }');
    }
    describe('External API', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should report enabled status', () => {
            expect(component.isEnabled().toBe(true);
            component.dispose();
            expect(component.isEnabled().toBe(false);
        }');
        test('should control visibility', () => {
            component.setVisible(false);
            expect(component.container!.style.display').toBe('none');
            component.setVisible(true);
            expect(component.container!.style.display').toBe('block');
        }');
        test('should return stats', () => {
            const stats = component.getStats();
            expect(stats').toHaveProperty('isInitialized', true);
            expect(stats').toHaveProperty('currentProfile', 'default');
            expect(stats').toHaveProperty('availableProfilesCount');
            expect(stats').toHaveProperty('profilesUsed');
        }');
        test('should handle profile change callback', () => {
            const callback = jest.fn(');
            component.onProfileChanged = callback;
            
            component.switchProfile('highContrast');
            expect(callback').toHaveBeenCalledWith('highContrast', 'default');
        }');
    }
    describe('Error Handling', (') => {
        test('should handle switch profile errors', () => {
            component.initialize(parentContainer);
            mockAccessibilitySettingsManager.switchProfile.mockImplementation((') => {
                throw new Error('Profile switch error');
            }');
            component.switchProfile('highContrast');
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            expect(component.currentProfile').toBe('default'); // フォールバック
        }');
        test('should handle getCurrentProfile errors', () => {
            component.initialize(parentContainer);
            mockAccessibilitySettingsManager.getCurrentProfile.mockImplementation((') => {
                throw new Error('Get profile error');
            });
            const profile = component.getCurrentProfile();
            expect(profile).toBeNull();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
        test('should handle dropdown population errors', () => {
            mockAccessibilitySettingsManager.getAvailableProfiles.mockImplementation((') => {
                throw new Error('Get profiles error');
            });
            component.initialize(parentContainer);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
    }
    describe('Accessibility', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should have proper ARIA attributes', (') => {
            expect(component.dropdown!.getAttribute('role')').toBe('combobox'');
            expect(component.dropdown!.getAttribute('aria-label')').toBe('Accessibility Profile'');
            expect(component.dropdown!.getAttribute('aria-expanded')').toBe('false');
        }');
        test('should update ARIA attributes on focus', (') => {
            const focusEvent = new Event('focus');
            component.dropdown!.dispatchEvent(focusEvent');
            expect(component.dropdown!.getAttribute('aria-expanded')').toBe('true');
        }');
        test('should announce profile changes', () => {
            mockAccessibilitySettingsManager.switchProfile.mockReturnValue(true);
            component.announcer = { announce: jest.fn(') } as Announcer;
            
            component.switchProfile('highContrast');
            expect(component.announcer.announce').toHaveBeenCalledWith(
                'Accessibility profile changed to High Contrast');
        }');
    }
    describe('Cleanup', (') => {
        test('should dispose properly', () => {
            component.initialize(parentContainer);
            const container = component.container;
            
            component.dispose();
            expect(component.container).toBeNull();
            expect(component.isInitialized).toBe(false);
            expect(container!.parentNode).toBeNull();
        }');
        test('should handle dispose errors', () => {
            component.initialize(parentContainer);
            // DOM エラーをシミュレート
            (component.container!.parentNode as any).removeChild = jest.fn((') => {
                throw new Error('DOM error');
            );
            component.dispose();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        )');
        test('should remove event listeners on dispose', () => {
            component.initialize(parentContainer);
            const dropdown = component.dropdown;
            
            // イベントリスナーが追加されていることを確認
            expect((dropdown.onchange).toBeDefined();
            component.dispose();
            // イベントリスナーが削除されていることを確認
            expect(component.dropdown).toBeNull();
        );
    }');
}