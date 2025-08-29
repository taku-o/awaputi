import { VolumeControlComponent } from '../../../src/components/VolumeControlComponent.js';

// モックの作成
const mockGameEngine = {
    settingsManager: {
        get: jest.fn(),
        set: jest.fn()
    },
    audioManager: {
        playUISound: jest.fn()
    }
};

const mockErrorHandler = {
    handleError: jest.fn()
};

const mockLocalizationManager = {
    getText: jest.fn()
};

// モジュールのモック
jest.mock('../../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
}));

jest.mock('../../../src/core/LocalizationManager.js', () => ({
    getLocalizationManager: () => mockLocalizationManager
}));

describe('VolumeControlComponent', () => {
    let component;
    let parentContainer;

    beforeEach(() => {
        // DOM環境をセットアップ
        document.body.innerHTML = '';
        parentContainer = document.createElement('div');
        document.body.appendChild(parentContainer);

        // モックをリセット
        jest.clearAllMocks();
        mockGameEngine.settingsManager.get.mockReturnValue(0.5);
        mockLocalizationManager.getText.mockImplementation((key) => {
            const translations = {
                'settings.audio.masterVolume': 'Master Volume',
                'settings.audio.volumeUp': 'Volume Up',
                'settings.audio.volumeDown': 'Volume Down'
            };
            return translations[key] || key;
        });

        component = new VolumeControlComponent(mockGameEngine);
    });

    afterEach(() => {
        if (component) {
            component.dispose();
        }
    });

    describe('Constructor', () => {
        test('should initialize with default values', () => {
            expect(component.gameEngine).toBe(mockGameEngine);
            expect(component.VOLUME_STEP).toBe(0.1);
            expect(component.MIN_VOLUME).toBe(0);
            expect(component.MAX_VOLUME).toBe(1);
            expect(component.currentVolume).toBe(0.5);
            expect(component.isInitialized).toBe(false);
        });

        test('should get current volume from settings manager', () => {
            mockGameEngine.settingsManager.get.mockReturnValue(0.7);
            const newComponent = new VolumeControlComponent(mockGameEngine);
            expect(newComponent.currentVolume).toBe(0.7);
            expect(mockGameEngine.settingsManager.get).toHaveBeenCalledWith('masterVolume');
        });

        test('should handle settings manager error gracefully', () => {
            mockGameEngine.settingsManager.get.mockImplementation(() => {
                throw new Error('Settings error');
            });
            const newComponent = new VolumeControlComponent(mockGameEngine);
            expect(newComponent.currentVolume).toBe(0.5); // フォールバック値
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    });

    describe('Initialization', () => {
        test('should initialize successfully', () => {
            const result = component.initialize(parentContainer);
            expect(result).toBe(true);
            expect(component.isInitialized).toBe(true);
            expect(component.container).toBeDefined();
            expect(component.container.parentNode).toBe(parentContainer);
        });

        test('should prevent double initialization', () => {
            component.initialize(parentContainer);
            const result = component.initialize(parentContainer);
            expect(result).toBe(true);
            expect(console.warn).toHaveBeenCalledWith('[VolumeControlComponent] Already initialized');
        });

        test('should handle invalid parent container', () => {
            const result = component.initialize(null);
            expect(result).toBe(false);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    });

    describe('Volume Control', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        });

        test('should handle volume up', () => {
            component.currentVolume = 0.5;
            component.handleVolumeUp();
            
            expect(component.currentVolume).toBe(0.6);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.6);
            expect(mockGameEngine.audioManager.playUISound).toHaveBeenCalledWith('button-click', { volume: 0.3 });
        });

        test('should handle volume down', () => {
            component.currentVolume = 0.5;
            component.handleVolumeDown();
            
            expect(component.currentVolume).toBe(0.4);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.4);
            expect(mockGameEngine.audioManager.playUISound).toHaveBeenCalledWith('button-click', { volume: 0.3 });
        });

        test('should handle volume up at maximum', () => {
            component.currentVolume = 1.0;
            component.handleVolumeUp();
            
            expect(component.currentVolume).toBe(1.0); // 変わらない
            expect(mockGameEngine.audioManager.playUISound).toHaveBeenCalledWith('error', { volume: 0.2 });
        });

        test('should handle volume down at minimum', () => {
            component.currentVolume = 0.0;
            component.handleVolumeDown();
            
            expect(component.currentVolume).toBe(0.0); // 変わらない
            expect(mockGameEngine.audioManager.playUISound).toHaveBeenCalledWith('error', { volume: 0.2 });
        });

        test('should set volume directly', () => {
            component.setVolume(0.75);
            expect(component.currentVolume).toBe(0.7); // 10%刻みに丸められる
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.7);
        });

        test('should clamp volume values', () => {
            component.setVolume(-0.1);
            expect(component.currentVolume).toBe(0.0);
            
            component.setVolume(1.5);
            expect(component.currentVolume).toBe(1.0);
        });
    });

    describe('UI Updates', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        });

        test('should update volume display', () => {
            component.currentVolume = 0.6;
            component.updateVolumeDisplay();
            
            expect(component.volumeDisplay.textContent).toBe('60%');
            expect(component.progressFill.style.width).toBe('60%');
        });

        test('should update button states at minimum volume', () => {
            component.currentVolume = 0.0;
            component.updateButtonStates();
            
            expect(component.volumeDownButton.disabled).toBe(true);
            expect(component.volumeDownButton.style.opacity).toBe('0.5');
            expect(component.volumeUpButton.disabled).toBe(false);
        });

        test('should update button states at maximum volume', () => {
            component.currentVolume = 1.0;
            component.updateButtonStates();
            
            expect(component.volumeUpButton.disabled).toBe(true);
            expect(component.volumeUpButton.style.opacity).toBe('0.5');
            expect(component.volumeDownButton.disabled).toBe(false);
        });
    });

    describe('Event Handling', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        });

        test('should handle button clicks', () => {
            const initialVolume = component.currentVolume;
            
            component.volumeUpButton.click();
            expect(component.currentVolume).toBe(initialVolume + 0.1);
            
            component.volumeDownButton.click();
            expect(component.currentVolume).toBe(initialVolume);
        });

        test('should handle progress bar clicks', () => {
            const progressBar = component.progressBar;
            const clickEvent = new MouseEvent('click', {
                clientX: 150, // 50% of 300px width
                bubbles: true
            });
            
            // モック getBoundingClientRect
            progressBar.getBoundingClientRect = jest.fn(() => ({
                left: 100,
                width: 200
            }));
            
            progressBar.dispatchEvent(clickEvent);
            expect(component.currentVolume).toBe(0.3); // 10%刻み
        });

        test('should handle keyboard events', () => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
            
            component.volumeUpButton.click = jest.fn();
            component.handleButtonKeydown(enterEvent);
            expect(enterEvent.preventDefault).toBeDefined();
            
            component.handleButtonKeydown(spaceEvent);
            expect(spaceEvent.preventDefault).toBeDefined();
        });
    });

    describe('External API', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        });

        test('should return current volume', () => {
            component.currentVolume = 0.8;
            expect(component.getCurrentVolume()).toBe(0.8);
        });

        test('should handle external volume changes', () => {
            component.onVolumeChanged(0.3);
            expect(component.currentVolume).toBe(0.3);
            expect(component.volumeDisplay.textContent).toBe('30%');
        });

        test('should report enabled status', () => {
            expect(component.isEnabled()).toBe(true);
            component.dispose();
            expect(component.isEnabled()).toBe(false);
        });

        test('should control visibility', () => {
            component.setVisible(false);
            expect(component.container.style.display).toBe('none');
            
            component.setVisible(true);
            expect(component.container.style.display).toBe('flex');
        });

        test('should return stats', () => {
            const stats = component.getStats();
            expect(stats).toHaveProperty('isInitialized', true);
            expect(stats).toHaveProperty('currentVolume');
            expect(stats).toHaveProperty('currentVolumePercent');
            expect(stats).toHaveProperty('isAtMinVolume');
            expect(stats).toHaveProperty('isAtMaxVolume');
        });
    });

    describe('Error Handling', () => {
        test('should handle volume up errors', () => {
            component.initialize(parentContainer);
            mockGameEngine.settingsManager.set.mockImplementation(() => {
                throw new Error('Settings error');
            });
            
            component.handleVolumeUp();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });

        test('should handle progress bar click errors', () => {
            component.initialize(parentContainer);
            const progressBar = component.progressBar;
            progressBar.getBoundingClientRect = jest.fn(() => {
                throw new Error('DOM error');
            });
            
            const clickEvent = new MouseEvent('click', { clientX: 150 });
            progressBar.dispatchEvent(clickEvent);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        });

        test('should update accessibility attributes', () => {
            component.currentVolume = 1.0;
            component.updateAccessibility();
            
            expect(component.volumeUpButton.getAttribute('aria-disabled')).toBe('true');
            expect(component.volumeDownButton.getAttribute('aria-disabled')).toBe('false');
            expect(component.progressBar.getAttribute('aria-valuenow')).toBe('100');
        });

        test('should have proper ARIA labels', () => {
            expect(component.volumeUpButton.getAttribute('aria-label')).toBe('Volume Up');
            expect(component.volumeDownButton.getAttribute('aria-label')).toBe('Volume Down');
            expect(component.progressBar.getAttribute('role')).toBe('slider');
        });
    });

    describe('Cleanup', () => {
        test('should dispose properly', () => {
            component.initialize(parentContainer);
            const container = component.container;
            
            component.dispose();
            
            expect(component.container).toBeNull();
            expect(component.isInitialized).toBe(false);
            expect(container.parentNode).toBeNull();
        });

        test('should handle dispose errors', () => {
            component.initialize(parentContainer);
            // DOM エラーをシミュレート
            component.container.parentNode.removeChild = jest.fn(() => {
                throw new Error('DOM error');
            });
            
            component.dispose();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    });
});