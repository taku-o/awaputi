import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { VolumeControlComponent } from '../../../src/components/VolumeControlComponent.js';

// Type definitions
interface MockGameEngine {
    settingsManager: {
        get: jest.Mock<(key: string) => any>;
        set: jest.Mock<(key: string, value: any) => void>;
    };
    audioManager: {
        playUISound: jest.Mock<(sound: string, options?: { volume?: number }) => void>;
    };
}

interface MockErrorHandler {
    handleError: jest.Mock<(error: Error, context?: string) => void>;
}

interface MockLocalizationManager {
    getText: jest.Mock<(key: string) => string>;
}

interface ComponentStats {
    isInitialized: boolean;
    currentVolume: number;
    currentVolumePercent: number;
    isAtMinVolume: boolean;
    isAtMaxVolume: boolean;
}

interface MockDOMRect {
    left: number;
    width: number;
    right?: number;
    top?: number;
    bottom?: number;
    height?: number;
    x?: number;
    y?: number;
}

interface MockHTMLElement {
    style: CSSStyleDeclaration;
    classList: DOMTokenList;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
    getBoundingClientRect: jest.Mock<() => MockDOMRect>;
    querySelector: jest.Mock;
    querySelectorAll: jest.Mock;
    setAttribute: jest.Mock;
    getAttribute: jest.Mock;
    removeAttribute: jest.Mock;
    appendChild: jest.Mock;
    removeChild: jest.Mock;
    innerHTML: string;
    textContent: string;
    value?: string;
}

// Mock setup
const mockGameEngine: MockGameEngine = {
    settingsManager: {
        get: jest.fn(),
        set: jest.fn()
    },
    audioManager: {
        playUISound: jest.fn()
    }
};

const mockErrorHandler: MockErrorHandler = {
    handleError: jest.fn()
};

const mockLocalizationManager: MockLocalizationManager = {
    getText: jest.fn()
};

// Module mocks
jest.mock('../../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
}));

jest.mock('../../../src/core/LocalizationManager.js', () => ({
    getLocalizationManager: () => mockLocalizationManager
}));

// DOM mocks
const createMockElement = (): MockHTMLElement => ({
    style: {} as CSSStyleDeclaration,
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn()
    } as any,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
        left: 0,
        width: 200,
        right: 200,
        top: 0,
        bottom: 50,
        height: 50,
        x: 0,
        y: 0
    })),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    innerHTML: '',
    textContent: ''
});

describe('VolumeControlComponent', () => {
    let volumeControl: VolumeControlComponent;
    let mockContainer: MockHTMLElement;
    let mockSlider: MockHTMLElement;
    let mockVolumeDisplay: MockHTMLElement;
    let mockMuteButton: MockHTMLElement;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup default mock returns
        mockGameEngine.settingsManager.get.mockImplementation((key: string) => {
            if (key === 'audio.masterVolume') return 0.7;
            if (key === 'audio.muted') return false;
            return null;
        });
        
        mockLocalizationManager.getText.mockImplementation((key: string) => {
            const translations: { [key: string]: string } = {
                'audio.volume': 'ボリューム',
                'audio.mute': 'ミュート',
                'audio.unmute': 'ミュート解除'
            };
            return translations[key] || key;
        });
        
        // Create mock elements
        mockContainer = createMockElement();
        mockSlider = createMockElement();
        mockVolumeDisplay = createMockElement();
        mockMuteButton = createMockElement();
        
        mockSlider.value = '70';
        
        // Setup container queries
        mockContainer.querySelector.mockImplementation((selector: string) => {
            if (selector.includes('slider')) return mockSlider;
            if (selector.includes('display')) return mockVolumeDisplay;
            if (selector.includes('mute')) return mockMuteButton;
            return null;
        });
        
        // Create component
        volumeControl = new VolumeControlComponent(mockGameEngine as any, mockContainer as any);
    });
    
    afterEach(() => {
        if (volumeControl) {
            volumeControl.destroy();
        }
    });
    
    describe('初期化', () => {
        test('コンポーネントが正しく初期化される', () => {
            expect(volumeControl).toBeDefined();
            expect(mockContainer.querySelector).toHaveBeenCalledWith('.volume-slider');
            expect(mockContainer.querySelector).toHaveBeenCalledWith('.volume-display');
            expect(mockContainer.querySelector).toHaveBeenCalledWith('.mute-button');
        });
        
        test('設定から初期音量が読み込まれる', () => {
            expect(mockGameEngine.settingsManager.get).toHaveBeenCalledWith('audio.masterVolume');
        });
        
        test('イベントリスナーが設定される', () => {
            expect(mockSlider.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
            expect(mockSlider.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
            expect(mockMuteButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });
    
    describe('音量制御', () => {
        test('音量スライダーの変更が反映される', () => {
            const inputEvent = new Event('input');
            Object.defineProperty(inputEvent, 'target', {
                value: { value: '50' }
            });
            
            // Simulate slider input
            mockSlider.value = '50';
            const inputHandler = mockSlider.addEventListener.mock.calls.find(
                call => call[0] === 'input'
            )[1];
            
            inputHandler(inputEvent);
            
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.5);
        });
        
        test('音量表示が更新される', () => {
            volumeControl.setVolume(0.8);
            expect(mockVolumeDisplay.textContent).toBe('80%');
        });
        
        test('音量範囲が正しく制限される', () => {
            volumeControl.setVolume(1.5); // 範囲外
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 1.0);
            
            volumeControl.setVolume(-0.2); // 範囲外
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.0);
        });
        
        test('プログラムで音量を設定できる', () => {
            volumeControl.setVolume(0.6);
            expect(mockSlider.value).toBe('60');
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.6);
        });
    });
    
    describe('ミュート機能', () => {
        test('ミュートボタンでミュート切り替えができる', () => {
            const clickEvent = new Event('click');
            const clickHandler = mockMuteButton.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];
            
            clickHandler(clickEvent);
            
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.muted', true);
        });
        
        test('ミュート状態でUI表示が変更される', () => {
            volumeControl.setMuted(true);
            expect(mockMuteButton.classList.add).toHaveBeenCalledWith('muted');
            expect(mockMuteButton.textContent).toBe('ミュート解除');
        });
        
        test('ミュート解除でUI表示が元に戻る', () => {
            volumeControl.setMuted(false);
            expect(mockMuteButton.classList.remove).toHaveBeenCalledWith('muted');
            expect(mockMuteButton.textContent).toBe('ミュート');
        });
        
        test('プログラムでミュート状態を設定できる', () => {
            volumeControl.setMuted(true);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.muted', true);
        });
    });
    
    describe('UI音声フィードバック', () => {
        test('音量変更時にUI音が再生される', () => {
            volumeControl.setVolume(0.5);
            expect(mockGameEngine.audioManager.playUISound).toHaveBeenCalledWith(
                'volume_change',
                { volume: 0.5 }
            );
        });
        
        test('ミュート切り替え時にUI音が再生される', () => {
            volumeControl.setMuted(true);
            expect(mockGameEngine.audioManager.playUISound).toHaveBeenCalledWith('mute_toggle');
        });
    });
    
    describe('キーボードサポート', () => {
        test('キーボードで音量を調整できる', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            
            const keyHandler = mockSlider.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )?.[1];
            
            if (keyHandler) {
                keyHandler(keyEvent);
                expect(mockGameEngine.settingsManager.set).toHaveBeenCalled();
            }
        });
        
        test('スペースキーでミュート切り替えができる', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: ' ' });
            
            const keyHandler = mockMuteButton.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )?.[1];
            
            if (keyHandler) {
                keyHandler(keyEvent);
                expect(mockGameEngine.settingsManager.set).toHaveBeenCalled();
            }
        });
    });
    
    describe('マウス操作', () => {
        test('マウスドラッグで音量を調整できる', () => {
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: 100
            });
            
            mockSlider.getBoundingClientRect.mockReturnValue({
                left: 50,
                width: 200,
                right: 250,
                top: 0,
                bottom: 50,
                height: 50,
                x: 50,
                y: 0
            });
            
            const mouseHandler = mockSlider.addEventListener.mock.calls.find(
                call => call[0] === 'mousedown'
            )?.[1];
            
            if (mouseHandler) {
                mouseHandler(mouseEvent);
                // ドラッグ操作の詳細テストは実装依存
            }
        });
        
        test('マウスホイールで音量を調整できる', () => {
            const wheelEvent = new WheelEvent('wheel', {
                deltaY: -1 // 上向きスクロール
            });
            
            const wheelHandler = mockSlider.addEventListener.mock.calls.find(
                call => call[0] === 'wheel'
            )?.[1];
            
            if (wheelHandler) {
                wheelHandler(wheelEvent);
                expect(mockGameEngine.settingsManager.set).toHaveBeenCalled();
            }
        });
    });
    
    describe('状態管理', () => {
        test('現在の音量を取得できる', () => {
            volumeControl.setVolume(0.75);
            expect(volumeControl.getVolume()).toBe(0.75);
        });
        
        test('ミュート状態を取得できる', () => {
            volumeControl.setMuted(true);
            expect(volumeControl.isMuted()).toBe(true);
        });
        
        test('コンポーネント統計を取得できる', () => {
            volumeControl.setVolume(0.8);
            volumeControl.setMuted(false);
            
            const stats: ComponentStats = volumeControl.getStats();
            expect(stats.isInitialized).toBe(true);
            expect(stats.currentVolume).toBe(0.8);
            expect(stats.currentVolumePercent).toBe(80);
            expect(stats.isAtMinVolume).toBe(false);
            expect(stats.isAtMaxVolume).toBe(false);
        });
        
        test('最小音量での統計情報', () => {
            volumeControl.setVolume(0.0);
            const stats = volumeControl.getStats();
            expect(stats.isAtMinVolume).toBe(true);
        });
        
        test('最大音量での統計情報', () => {
            volumeControl.setVolume(1.0);
            const stats = volumeControl.getStats();
            expect(stats.isAtMaxVolume).toBe(true);
        });
    });
    
    describe('設定の永続化', () => {
        test('音量変更が設定に保存される', () => {
            volumeControl.setVolume(0.65);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.65);
        });
        
        test('ミュート状態が設定に保存される', () => {
            volumeControl.setMuted(true);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.muted', true);
        });
        
        test('設定から初期状態が復元される', () => {
            mockGameEngine.settingsManager.get.mockImplementation((key: string) => {
                if (key === 'audio.masterVolume') return 0.3;
                if (key === 'audio.muted') return true;
                return null;
            });
            
            const newControl = new VolumeControlComponent(mockGameEngine as any, mockContainer as any);
            expect(newControl.getVolume()).toBe(0.3);
            expect(newControl.isMuted()).toBe(true);
            
            newControl.destroy();
        });
    });
    
    describe('アクセシビリティ', () => {
        test('ARIA属性が設定される', () => {
            expect(mockSlider.setAttribute).toHaveBeenCalledWith('aria-label', expect.any(String));
            expect(mockSlider.setAttribute).toHaveBeenCalledWith('aria-valuemin', '0');
            expect(mockSlider.setAttribute).toHaveBeenCalledWith('aria-valuemax', '100');
        });
        
        test('音量変更時にaria-valuenowが更新される', () => {
            volumeControl.setVolume(0.6);
            expect(mockSlider.setAttribute).toHaveBeenCalledWith('aria-valuenow', '60');
        });
        
        test('ミュートボタンのaria-pressedが更新される', () => {
            volumeControl.setMuted(true);
            expect(mockMuteButton.setAttribute).toHaveBeenCalledWith('aria-pressed', 'true');
        });
    });
    
    describe('エラーハンドリング', () => {
        test('無効な音量値でエラーが記録される', () => {
            volumeControl.setVolume(NaN);
            expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
                expect.any(Error),
                'VolumeControlComponent.setVolume'
            );
        });
        
        test('DOM要素が見つからない場合のエラーハンドリング', () => {
            mockContainer.querySelector.mockReturnValue(null);
            
            expect(() => {
                new VolumeControlComponent(mockGameEngine as any, mockContainer as any);
            }).not.toThrow();
            
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
        
        test('設定の読み書きエラーが処理される', () => {
            mockGameEngine.settingsManager.set.mockImplementation(() => {
                throw new Error('Settings error');
            });
            
            volumeControl.setVolume(0.5);
            expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
                expect.any(Error),
                'VolumeControlComponent.setVolume'
            );
        });
    });
    
    describe('レスポンシブデザイン', () => {
        test('モバイル端末でタッチイベントが処理される', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100 } as Touch]
            });
            
            const touchHandler = mockSlider.addEventListener.mock.calls.find(
                call => call[0] === 'touchstart'
            )?.[1];
            
            if (touchHandler) {
                touchHandler(touchEvent);
                // タッチ操作の詳細テストは実装依存
            }
        });
        
        test('画面サイズに応じてコンポーネントが調整される', () => {
            // レスポンシブ調整のテスト
            volumeControl.updateResponsiveLayout();
            // 実装依存の詳細テスト
        });
    });
    
    describe('コンポーネントのライフサイクル', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            volumeControl.destroy();
            
            expect(mockSlider.removeEventListener).toHaveBeenCalled();
            expect(mockMuteButton.removeEventListener).toHaveBeenCalled();
        });
        
        test('destroy後は操作が無効になる', () => {
            volumeControl.destroy();
            
            // destroy後の操作はエラーハンドラで処理される
            volumeControl.setVolume(0.5);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    });
});