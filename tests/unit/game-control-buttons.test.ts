/**
 * Unit tests for GameControlButtons component
 * Tests button rendering, click detection, responsive positioning, 
 * accessibility features, and mobile touch handling
 */
import { describe, test, expect, beforeEach, jest  } from '@jest/globals';
import { GameControlButtons  } from '../../src/scenes/game-scene/GameControlButtons.js';
// モック用の型定義
interface MockCanvas {
    width: number,
    height: number,
}
interface CanvasInfo {
    baseWidth: number,
    baseHeight: number,
    scale: number,
    scaleFactor?: number;
    displayWidth?: number;
    displayHeight?: number;
    actualWidth?: number;
    actualHeight?: number;
    pixelRatio?: number;
}
interface ScaledCoordinates {
    x: number,
    y: number,
}
interface MockResponsiveCanvasManager {
    getCanvasInfo: jest.Mock<() => CanvasInfo>;
    getScaledCoordinates: jest.Mock<(;x: number, y: number) => ScaledCoordinates>;
}
interface MockGameEngine {
    canvas: MockCanvas,
    responsiveCanvasManager: MockResponsiveCanvasManager | null,
}
interface MockUIManager {
    showConfirmationDialog: jest.Mock,
}
interface ButtonConfig {
    text: string,
    size: {
        widt;h: number,
        height: number,
    };
    position?: {
        x: number,
        y: number,
    };
    style?: any;
}
interface ButtonConfigMap {
    giveUp: ButtonConfig,
    restart: ButtonConfig,
}
interface ButtonState {
    enabled: boolean,
    hoveredButton: string | null,
    activeButton: string | null,
    visibility: {
        giveU;p: boolean,
        restart: boolean,
    };
}
interface GameState {
    isGameStarted: boolean,
    isGameOver: boolean,
    isPaused: boolean,
    isPreGame: boolean,
}
interface TouchEvent {
    key?: string;
    shiftKey?: boolean;
    preventDefault?: jest.Mock;
}
interface MockRenderingContext {
    save: jest.Mock,
    restore: jest.Mock,
    fillRect: jest.Mock,
    strokeRect: jest.Mock,
    fillText: jest.Mock,
    createLinearGradient: jest.Mock<(') => MockGradient>;
    setLineDash: jest.Mock,
    fillStyle: string,
    strokeStyle: string,
    lineWidth: number,
    font: string,
    textAlign: string,
    textBaseline: string,
    shadowColor: string,
    shadowOffsetX: number,
    shadowOffsetY: number,
    shadowBlur: number,
}
interface MockGradient {
    addColorStop: jest.Mock,
}
interface DeviceInfo {
    isTouchDevice: boolean,
    isMobile: boolean,
}
interface AccessibilityState {
    focusedButton: string | null,
}
interface ButtonBounds {
    x: number,
    y: number,
    width: number,
    height: number,
}
describe('GameControlButtons', () => {
    let gameEngine: MockGameEngine,
    let uiManager: MockUIManager,
    let gameControlButtons: GameControlButtons,
    let mockCanvas: MockCanvas,
    let mockResponsiveCanvasManager: MockResponsiveCanvasManager,
    beforeEach(() => {
        // Canvas mock setup
        mockCanvas = {
            width: 800,
            height: 600
        };
        // ResponsiveCanvasManager mock setup
        mockResponsiveCanvasManager = {
            getCanvasInfo: jest.fn(() => ({
                baseWidth: 800,
                baseHeight: 600,
                scale: 1.5
    }))),
            getScaledCoordinates: jest.fn((x: number, y: number) => ({
                x: x * 1.5,
                y: y * 1.5
    })))
        );
        // GameEngine mock setup
        gameEngine = {
            canvas: mockCanvas,
            responsiveCanvasManager: mockResponsiveCanvasManager
    });
        // UIManager mock setup
        uiManager = {
            showConfirmationDialog: jest.fn(),
        };
        gameControlButtons = new GameControlButtons(gameEngine: any, uiManager);
    }');
    describe('Initialization', (') => {
        test('should initialize with correct default configuration', () => {
            const config = (gameControlButtons.getButtonConfig() as ButtonConfigMap);
            expect(config.giveUp).toBeDefined();
            expect(config.restart).toBeDefined();
            expect(config.giveUp.text').toBe('ギブアップ');
            expect(config.restart.text').toBe('ゲーム再開始');
            expect(config.giveUp.size.width).toBe(120);
            expect(config.giveUp.size.height).toBe(44);
        }');
        test('should initialize with buttons disabled by default', () => {
            const state = (gameControlButtons.getButtonState() as ButtonState);
            expect(state.visibility.giveUp).toBe(false);
            expect(state.visibility.restart).toBe(false);
        }');
        test('should detect device capabilities correctly', () => {
            const deviceInfo = (gameControlButtons.deviceInfo as DeviceInfo);
            expect(deviceInfo).toBeDefined();
            expect(typeof deviceInfo.isTouchDevice').toBe('boolean');
            expect(typeof deviceInfo.isMobile').toBe('boolean');
        }');
    }
    describe('Button Positioning', (') => {
        test('should calculate correct button positions with ResponsiveCanvasManager', () => {
            (gameControlButtons.updateButtonPositions();
            const config = (gameControlButtons.getButtonConfig() as ButtonConfigMap);
            // Check that positions are calculated
            expect(config.giveUp.position).toBeDefined();
            expect(config.restart.position).toBeDefined();
            expect(typeof config.giveUp.position!.x').toBe('number');
            expect(typeof config.giveUp.position!.y').toBe('number');
        }');
        test('should handle missing ResponsiveCanvasManager gracefully', () => {
            gameEngine.responsiveCanvasManager = null;
            
            (gameControlButtons.updateButtonPositions();
            const config = (gameControlButtons.getButtonConfig() as ButtonConfigMap);
            expect(config.giveUp.position).toBeDefined();
            expect(config.restart.position).toBeDefined();
        }');
        test('should scale button bounds correctly', (') => {
            const bounds = (gameControlButtons.getButtonBounds('giveUp') as ButtonBounds);
            // With scale factor 1.5, width should be 120 * 1.5 = 180
            expect(bounds.width).toBe(180);
            expect(bounds.height).toBe(66); // 44 * 1.5
        }');
    }
    describe('Button Visibility Control', (') => {
        test('should show Give Up button only when game is started and not game over', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState)');
            expect((gameControlButtons.isButtonVisible('giveUp').toBe(true);
        }');
        test('should hide Give Up button when game is over', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: true,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState)');
            expect((gameControlButtons.isButtonVisible('giveUp').toBe(false);
        }');
        test('should show Restart button when game is started or game over', () => {
            // During game
            let gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState)');
            expect((gameControlButtons.isButtonVisible('restart').toBe(true);
            // Game over
            gameState = {
                isGameStarted: false,
                isGameOver: true,
                isPaused: false,
                isPreGame: false
    });
            (gameControlButtons.updateButtonVisibility(gameState)');
            expect((gameControlButtons.isButtonVisible('restart').toBe(true);
        }');
        test('should hide both buttons in pre-game state', () => {
            const gameState: GameState = {
                isGameStarted: false,
                isGameOver: false,
                isPaused: false,
                isPreGame: true
            };
            (gameControlButtons.updateButtonVisibility(gameState)');
            expect((gameControlButtons.isButtonVisible('giveUp').toBe(false)');
            expect((gameControlButtons.isButtonVisible('restart').toBe(false);
        }');
    }
    describe('Click Detection', () => {
        beforeEach(() => {
            // Make buttons visible for click tests
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState);
        }');
        test('should detect clicks within button bounds correctly', () => {
            // Mock button positions for predictable testing
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap');
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const isClicked = (gameControlButtons.isButtonClicked(150, 70, 'giveUp');
            expect(isClicked).toBe(true);
        }');
        test('should reject clicks outside button bounds', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap');
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const isClicked = (gameControlButtons.isButtonClicked(50, 25, 'giveUp');
            expect(isClicked).toBe(false);
        }');
        test('should handle click and return correct button type', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap);
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            buttonConfig.restart.position = { x: 100, y: 100 };
            
            const clickedButton = (gameControlButtons.handleClick(150, 70);
            expect(clickedButton').toBe('giveUp');
        }');
        test('should ignore clicks when buttons are disabled', () => {
            (gameControlButtons.setButtonsEnabled(false);
            const clickedButton = (gameControlButtons.handleClick(150, 70);
            expect(clickedButton).toBeNull();
        }');
        test('should ignore clicks on invisible buttons', () => {
            const gameState: GameState = {
                isGameStarted: false,
                isGameOver: false,
                isPaused: false,
                isPreGame: true
            };
            (gameControlButtons.updateButtonVisibility(gameState);
            const clickedButton = (gameControlButtons.handleClick(150, 70);
            expect(clickedButton).toBeNull();
        }');
    }
    describe('Hover State Management', () => {
        beforeEach(() => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState);
        }');
        test('should update hover state correctly', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap);
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            (gameControlButtons.updateMousePosition(150, 70);
            const state = (gameControlButtons.getButtonState() as ButtonState);
            expect(state.hoveredButton').toBe('giveUp');
        }');
        test('should clear hover state when mouse leaves button area', () => {
            (gameControlButtons.updateMousePosition(50, 25);
            const state = (gameControlButtons.getButtonState() as ButtonState);
            expect(state.hoveredButton).toBeNull();
        }');
        test('should clear keyboard focus when mouse is used', (') => {
            (gameControlButtons.setKeyboardFocus('giveUp');
            (gameControlButtons.updateMousePosition(150, 70);
            const accessibilityState = (gameControlButtons.accessibilityState as AccessibilityState);
            expect(accessibilityState.focusedButton).toBeNull();
        }');
    }
    describe('Keyboard Navigation', () => {
        beforeEach(() => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState);
        }');
        test('should handle Tab navigation correctly', (') => {
            const event: TouchEvent = {
                key: 'Tab',
                shiftKey: false,
        preventDefault: jest.fn(),
            };
            
            const handled = (gameControlButtons.handleKeyboardNavigation(event);
            expect(handled).toBe(true);
            expect(event.preventDefault!).toHaveBeenCalled();
        }');
        test('should handle Enter key activation', (') => {
            (gameControlButtons.setKeyboardFocus('giveUp')');
            const event: TouchEvent = {
                key: 'Enter',
        preventDefault: jest.fn(),
            };
            
            const handled = (gameControlButtons.handleKeyboardNavigation(event);
            expect(handled).toBe(true);
            expect(uiManager.showConfirmationDialog').toHaveBeenCalledWith('giveUp');
        }');
        test('should handle Space key activation', (') => {
            (gameControlButtons.setKeyboardFocus('restart')');
            const event: TouchEvent = {
                key: ', ',
        preventDefault: jest.fn(),
            };
            
            const handled = (gameControlButtons.handleKeyboardNavigation(event);
            expect(handled).toBe(true);
            expect(uiManager.showConfirmationDialog').toHaveBeenCalledWith('restart');
        }');
        test('should clear focus on Escape key', (') => {
            (gameControlButtons.setKeyboardFocus('giveUp')');
            const event: TouchEvent = { key: 'Escape' };
            const handled = (gameControlButtons.handleKeyboardNavigation(event);
            expect(handled).toBe(true);
            const accessibilityState = (gameControlButtons.accessibilityState as AccessibilityState);
            expect(accessibilityState.focusedButton).toBeNull();
        }');
        test('should cycle through visible buttons with Tab', () => {
            const visibleButtons = (gameControlButtons.getVisibleButtons() as string[]);
            expect(visibleButtons').toContain('giveUp');
            expect(visibleButtons').toContain('restart');
            (gameControlButtons.navigateButtons(1, visibleButtons);
            const accessibilityState = (gameControlButtons.accessibilityState as AccessibilityState);
            expect(accessibilityState.focusedButton').toBe('giveUp');
            (gameControlButtons.navigateButtons(1, visibleButtons);
            expect(accessibilityState.focusedButton').toBe('restart');
        }');
    }
    describe('Touch Handling', () => {
        beforeEach(() => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState);
        }');
        test('should handle touch start correctly', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap);
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const touchedButton = (gameControlButtons.handleTouchStart(150, 70);
            expect(touchedButton').toBe('giveUp');
            const buttonState = (gameControlButtons.buttonState as ButtonState);
            expect(buttonState.activeButton').toBe('giveUp');
        }');
        test('should handle touch end correctly when ending on same button', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap);
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            (gameControlButtons.handleTouchStart(150, 70);
            const completedButton = (gameControlButtons.handleTouchEnd(150, 70);
            expect(completedButton').toBe('giveUp');
            const buttonState = (gameControlButtons.buttonState as ButtonState);
            expect(buttonState.activeButton).toBeNull();
        }');
        test('should cancel touch when ending outside button', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap);
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            (gameControlButtons.handleTouchStart(150, 70);
            const completedButton = (gameControlButtons.handleTouchEnd(50, 25);
            expect(completedButton).toBeNull();
            const buttonState = (gameControlButtons.buttonState as ButtonState);
            expect(buttonState.activeButton).toBeNull();
        }');
        test('should handle touch cancel correctly', () => {
            const buttonState = (gameControlButtons.buttonState as ButtonState');
            buttonState.activeButton = 'giveUp';
            
            (gameControlButtons.handleTouchCancel();
            expect(buttonState.activeButton).toBeNull();
        }');
    }
    describe('Responsive Behavior', (') => {
        test('should handle canvas size changes', () => {
            const buttonConfig = (gameControlButtons.buttonConfig as ButtonConfigMap);
            const originalPositions = { ...buttonConfig.giveUp.position };
            
            // Change canvas size
            mockCanvas.width = 1200;
            mockCanvas.height = 900;
            
            (gameControlButtons.updateButtonPositions();
            // Positions should be recalculated
            expect(buttonConfig.giveUp.position).not.toEqual(originalPositions);
        }');
        test('should handle different scale factors', () => {
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue({
                baseWidth: 800,
                baseHeight: 600,
                scale: 2.0),
            }');
            const bounds = (gameControlButtons.getButtonBounds('giveUp') as ButtonBounds);
            // With scale factor 2.0, width should be 120 * 2.0 = 240
            expect(bounds.width).toBe(240);
            expect(bounds.height).toBe(88); // 44 * 2.0
        }');
    }
    describe('Rendering', () => {
        let mockContext: MockRenderingContext,
        beforeEach(() => {
            mockContext = {
                save: jest.fn(),
                restore: jest.fn(),
                fillRect: jest.fn(),
                strokeRect: jest.fn(),
                fillText: jest.fn(),
                createLinearGradient: jest.fn(() => ({
                    addColorStop: jest.fn(),
    }))),
                setLineDash: jest.fn('),
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 0,
                font: '',
                textAlign: '',
                textBaseline: '',
                shadowColor: '',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 0
    });
        )');
        test('should render visible buttons only', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState);
            (gameControlButtons.render(mockContext);
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        }');
        test('should not render when buttons are disabled', () => {
            (gameControlButtons.setButtonsEnabled(false);
            (gameControlButtons.render(mockContext);
            expect(mockContext.save).not.toHaveBeenCalled();
        }');
        test('should render focus indicator for keyboard navigation', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState)');
            (gameControlButtons.setKeyboardFocus('giveUp');
            (gameControlButtons.render(mockContext);
            expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 3]);
        }');
        test('should render touch feedback for active buttons', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons.updateButtonVisibility(gameState);
            const buttonState = (gameControlButtons.buttonState as ButtonState');
            buttonState.activeButton = 'giveUp';
            
            (gameControlButtons.render(mockContext);
            expect(mockContext.createLinearGradient).toHaveBeenCalled();
        }');
    }
    describe('State Management', (') => {
        test('should provide complete button state', () => {
            const state = (gameControlButtons.getButtonState() as ButtonState);
            expect(state').toHaveProperty('enabled');
            expect(state').toHaveProperty('hoveredButton');
            expect(state').toHaveProperty('activeButton');
            expect(state').toHaveProperty('visibility');
            expect(state.visibility').toHaveProperty('giveUp');
            expect(state.visibility').toHaveProperty('restart');
        }');
        test('should provide complete button configuration', () => {
            const config = (gameControlButtons.getButtonConfig() as ButtonConfigMap);
            expect(config').toHaveProperty('giveUp');
            expect(config').toHaveProperty('restart');
            expect(config.giveUp').toHaveProperty('text');
            expect(config.giveUp').toHaveProperty('size');
            expect(config.giveUp').toHaveProperty('style');
        });
    }
}');