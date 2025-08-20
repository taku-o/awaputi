import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { VolumeControlComponent } from '../../../src/components/VolumeControlComponent';
// Type definitions
interface MockGameEngine {
    settingsManager: {
        get: jest.Mock<(key: string) => any>;
        set: jest.Mock<(key: string, value => void>);
    };
    audioManager: {
        playUISound: jest.Mock<(sound: string, options?: {volume?: number}) => void>;
    };
}
interface MockErrorHandler {
    handleError: jest.Mock<(error: Error, context?: string) => void>;
}
interface MockLocalizationManager {
    getText: jest.Mock<(key: string) => string>;
}
interface ComponentStats {
    isInitialized: boolean,
    currentVolume: number,
    currentVolumePercent: number,
    isAtMinVolume: boolean,
    isAtMaxVolume: boolean,
}
interface MockDOMRect {
    left: number,
    width: number,
    right?: number;
    top?: number;
    bottom?: number;
    height?: number;
    x?: number;
    y?: number;
}
// Mock setup
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
    getText: jest.fn()'),
};
// Module mocks
jest.mock('../../../src/utils/ErrorHandler', () => ({
    getErrorHandler: () => mockErrorHandler
})');
jest.mock('../../../src/core/LocalizationManager', () => ({
    getLocalizationManager: () => mockLocalizationManager
}));
// Mock console.warn
const originalConsoleWarn = console.warn;
beforeEach(() => {
    console.warn = jest.fn();
});
afterEach(() => {
    console.warn = originalConsoleWarn;
}');
describe('VolumeControlComponent', () => {
    let component: VolumeControlComponent,
    let parentContainer: HTMLDivElement,
    beforeEach((') => {
        // Setup DOM environment
        document.body.innerHTML = '';
        parentContainer = document.createElement('div');
        document.body.appendChild(parentContainer);
        // Reset mocks
        jest.clearAllMocks();
        mockGameEngine.settingsManager.get.mockReturnValue(0.5);
        mockLocalizationManager.getText.mockImplementation((key: string') => {
            const translations: Record<string, string> = {
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
    }');
    describe('Constructor', (') => {
        test('should initialize with default values', () => {
            expect(component.gameEngine).toBe(mockGameEngine);
            expect(component.VOLUME_STEP).toBe(0.1);
            expect(component.MIN_VOLUME).toBe(0);
            expect(component.MAX_VOLUME).toBe(1);
            expect(component.currentVolume).toBe(0.5);
            expect(component.isInitialized).toBe(false);
        }');
        test('should get current volume from settings manager', () => {
            mockGameEngine.settingsManager.get.mockReturnValue(0.7);
            const newComponent = new VolumeControlComponent(mockGameEngine);
            expect(newComponent.currentVolume).toBe(0.7);
            expect(mockGameEngine.settingsManager.get').toHaveBeenCalledWith('masterVolume');
        }');
        test('should handle settings manager error gracefully', () => {
            mockGameEngine.settingsManager.get.mockImplementation((') => {
                throw new Error('Settings error');
            });
            const newComponent = new VolumeControlComponent(mockGameEngine);
            expect(newComponent.currentVolume).toBe(0.5); // Fallback value
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
        test('should prevent double initialization', () => {
            component.initialize(parentContainer);
            const result = component.initialize(parentContainer);
            expect(result).toBe(true);
            expect(console.warn').toHaveBeenCalledWith('[VolumeControlComponent] Already initialized');
        }');
        test('should handle invalid parent container', () => {
            const result = component.initialize(null as any);
            expect(result).toBe(false);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
    }
    describe('Volume Control', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should handle volume up', () => {
            component.currentVolume = 0.5;
            component.handleVolumeUp();
            expect(component.currentVolume).toBe(0.6);
            expect(mockGameEngine.settingsManager.set').toHaveBeenCalledWith('masterVolume', 0.6);
            expect(mockGameEngine.audioManager.playUISound').toHaveBeenCalledWith('button-click', { volume: 0.3 )'),
        }
        test('should handle volume down', () => {
            component.currentVolume = 0.5;
            component.handleVolumeDown();
            expect(component.currentVolume).toBe(0.4);
            expect(mockGameEngine.settingsManager.set').toHaveBeenCalledWith('masterVolume', 0.4);
            expect(mockGameEngine.audioManager.playUISound').toHaveBeenCalledWith('button-click', { volume: 0.3 )'),
        }
        test('should handle volume up at maximum', () => {
            component.currentVolume = 1.0;
            component.handleVolumeUp();
            expect(component.currentVolume).toBe(1.0); // No change
            expect(mockGameEngine.audioManager.playUISound').toHaveBeenCalledWith('error', { volume: 0.2 }');
        }
        test('should handle volume down at minimum', () => {
            component.currentVolume = 0.0;
            component.handleVolumeDown();
            expect(component.currentVolume).toBe(0.0); // No change
            expect(mockGameEngine.audioManager.playUISound').toHaveBeenCalledWith('error', { volume: 0.2 }');
        }
        test('should set volume directly', () => {
            component.setVolume(0.75);
            expect(component.currentVolume).toBe(0.7); // Rounded to 10% increments
            expect(mockGameEngine.settingsManager.set').toHaveBeenCalledWith('masterVolume', 0.7);
        }');
        test('should clamp volume values', () => {
            component.setVolume(-0.1);
            expect(component.currentVolume).toBe(0.0);
            component.setVolume(1.5);
            expect(component.currentVolume).toBe(1.0);
        }');
    }
    describe('UI Updates', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should update volume display', () => {
            component.currentVolume = 0.6;
            component.updateVolumeDisplay();
            expect(component.volumeDisplay!.textContent').toBe('60%');
            expect(component.progressFill!.style.width').toBe('60%');
        }');
        test('should update button states at minimum volume', () => {
            component.currentVolume = 0.0;
            component.updateButtonStates();
            expect(component.volumeDownButton!.disabled).toBe(true);
            expect(component.volumeDownButton!.style.opacity').toBe('0.5');
            expect(component.volumeUpButton!.disabled).toBe(false);
        }');
        test('should update button states at maximum volume', () => {
            component.currentVolume = 1.0;
            component.updateButtonStates();
            expect(component.volumeUpButton!.disabled).toBe(true);
            expect(component.volumeUpButton!.style.opacity').toBe('0.5');
            expect(component.volumeDownButton!.disabled).toBe(false);
        }');
    }
    describe('Event Handling', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should handle button clicks', () => {
            const initialVolume = component.currentVolume;
            
            component.volumeUpButton!.click();
            expect(component.currentVolume).toBe(initialVolume + 0.1);
            component.volumeDownButton!.click();
            expect(component.currentVolume).toBe(initialVolume);
        }');
        test('should handle progress bar clicks', (') => {
            const progressBar = component.progressBar!;
            const clickEvent = new MouseEvent('click', {
                clientX: 150, // 50% of 300px width
                bubbles: true
            });
            // Mock getBoundingClientRect
            progressBar.getBoundingClientRect = jest.fn((): DOMRect => ({
                left: 100,
                width: 200,
                right: 300,
                top: 0,
                bottom: 0,
                height: 0,
                x: 100,
                y: 0,
                toJSON: () => ({});
            } as DOMRect);
            progressBar.dispatchEvent(clickEvent);
            expect(component.currentVolume).toBe(0.3); // Rounded to 10% increments
        }');
        test('should handle keyboard events', (') => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' }');
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' }');
            const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault'');
            const preventDefaultSpySp = jest.spyOn(spaceEvent, 'preventDefault');
            component.volumeUpButton!.click = jest.fn();
            component.handleButtonKeydown(enterEvent);
            expect(preventDefaultSpy).toHaveBeenCalled();
            component.handleButtonKeydown(spaceEvent);
            expect(preventDefaultSpySp).toHaveBeenCalled();
        }');
    }
    describe('External API', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should return current volume', () => {
            component.currentVolume = 0.8;
            expect(component.getCurrentVolume().toBe(0.8);
        }');
        test('should handle external volume changes', () => {
            component.onVolumeChanged(0.3);
            expect(component.currentVolume).toBe(0.3);
            expect(component.volumeDisplay!.textContent').toBe('30%');
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
            expect(component.container!.style.display').toBe('flex');
        }');
        test('should return stats', () => {
            const stats = component.getStats() as ComponentStats;
            expect(stats').toHaveProperty('isInitialized', true);
            expect(stats').toHaveProperty('currentVolume');
            expect(stats').toHaveProperty('currentVolumePercent');
            expect(stats').toHaveProperty('isAtMinVolume');
            expect(stats').toHaveProperty('isAtMaxVolume');
        }');
    }
    describe('Error Handling', (') => {
        test('should handle volume up errors', () => {
            component.initialize(parentContainer);
            mockGameEngine.settingsManager.set.mockImplementation((') => {
                throw new Error('Settings error');
            });
            component.handleVolumeUp();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
        test('should handle progress bar click errors', () => {
            component.initialize(parentContainer);
            const progressBar = component.progressBar!;
            progressBar.getBoundingClientRect = jest.fn((') => {
                throw new Error('DOM error');
            )');
            const clickEvent = new MouseEvent('click', { clientX: 150 )),
            progressBar.dispatchEvent(clickEvent);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }');
    }
    describe('Accessibility', () => {
        beforeEach(() => {
            component.initialize(parentContainer);
        }');
        test('should update accessibility attributes', () => {
            component.currentVolume = 1.0;
            component.updateAccessibility(');
            expect(component.volumeUpButton!.getAttribute('aria-disabled')').toBe('true'');
            expect(component.volumeDownButton!.getAttribute('aria-disabled')').toBe('false'');
            expect(component.progressBar!.getAttribute('aria-valuenow')').toBe('100');
        }');
        test('should have proper ARIA labels', (') => {
            expect(component.volumeUpButton!.getAttribute('aria-label')').toBe('Volume Up'');
            expect(component.volumeDownButton!.getAttribute('aria-label')').toBe('Volume Down'');
            expect(component.progressBar!.getAttribute('role')').toBe('slider');
        }');
    }
    describe('Cleanup', (') => {
        test('should dispose properly', () => {
            component.initialize(parentContainer);
            const container = component.container!;
            
            component.dispose();
            expect(component.container).toBeNull();
            expect(component.isInitialized).toBe(false);
            expect(container.parentNode).toBeNull();
        }');
        test('should handle dispose errors', () => {
            component.initialize(parentContainer);
            // Simulate DOM error
            const mockRemoveChild = jest.fn((') => {
                throw new Error('DOM error');
            ));
            if (component.container!.parentNode) {
                (component.container!.parentNode as any).removeChild = mockRemoveChild;
            )
            ;
            component.dispose();
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    }
}');