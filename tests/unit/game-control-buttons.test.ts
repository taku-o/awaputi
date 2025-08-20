/**
 * Unit tests for GameControlButtons component
 * Tests button rendering, click detection, responsive positioning, 
 * accessibility features, and mobile touch handling
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GameControlButtons } from '../../src/scenes/game-scene/GameControlButtons.js';

// モック用の型定義
interface MockCanvas {
    width: number;
    height: number;
}

interface CanvasInfo {
    baseWidth: number;
    baseHeight: number;
    scale: number;
    scaleFactor?: number;
    displayWidth?: number;
    displayHeight?: number;
    actualWidth?: number;
    actualHeight?: number;
    pixelRatio?: number;
}

interface ScaledCoordinates {
    x: number;
    y: number;
}

interface MockResponsiveCanvasManager {
    getCanvasInfo: jest.Mock<() => CanvasInfo>;
    getScaledCoordinates: jest.Mock<(x: number, y: number) => ScaledCoordinates>;
}

interface MockGameEngine {
    canvas: MockCanvas;
    responsiveCanvasManager: MockResponsiveCanvasManager | null;
}

interface MockUIManager {
    showConfirmationDialog: jest.Mock;
}

interface ButtonConfig {
    text: string;
    size: {
        width: number;
        height: number;
    };
    position?: {
        x: number;
        y: number;
    };
    style?: any;
}

interface ButtonConfigMap {
    giveUp: ButtonConfig;
    restart: ButtonConfig;
}

interface ButtonState {
    enabled: boolean;
    hoveredButton: string | null;
    activeButton: string | null;
    visibility: {
        giveUp: boolean;
        restart: boolean;
    };
}

interface GameState {
    isGameStarted: boolean;
    isGameOver: boolean;
    isPaused: boolean;
    isPreGame: boolean;
}

interface TouchEvent {
    key?: string;
    shiftKey?: boolean;
    preventDefault?: jest.Mock;
}

interface MockRenderingContext {
    save: jest.Mock;
    restore: jest.Mock;
    fillRect: jest.Mock;
    strokeRect: jest.Mock;
    fillText: jest.Mock;
    createLinearGradient: jest.Mock<() => MockGradient>;
    setLineDash: jest.Mock;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
}

interface MockGradient {
    addColorStop: jest.Mock;
}

interface DeviceInfo {
    isTouchDevice: boolean;
    isMobile: boolean;
}

interface AccessibilityState {
    focusedButton: string | null;
}

interface ButtonBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

describe('GameControlButtons', () => {
    let gameEngine: MockGameEngine;
    let uiManager: MockUIManager;
    let gameControlButtons: GameControlButtons;
    let mockCanvas: MockCanvas;
    let mockResponsiveCanvasManager: MockResponsiveCanvasManager;

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
            })),
            getScaledCoordinates: jest.fn((x: number, y: number) => ({
                x: x * 1.5,
                y: y * 1.5
            }))
        };

        // GameEngine mock setup
        gameEngine = {
            canvas: mockCanvas,
            responsiveCanvasManager: mockResponsiveCanvasManager
        };

        // UIManager mock setup
        uiManager = {
            showConfirmationDialog: jest.fn()
        };

        gameControlButtons = new GameControlButtons(gameEngine: any, uiManager: any3679;
    });

    describe('Initialization', () => {
        test('should initialize with correct default configuration', () => {
            const config = (gameControlButtons: any3870.getButtonConfig() as ButtonConfigMap;
            
            expect(config.giveUp).toBeDefined();
            expect(config.restart).toBeDefined();
            expect(config.giveUp.text).toBe('ギブアップ');
            expect(config.restart.text).toBe('ゲーム再開始');
            expect(config.giveUp.size.width).toBe(120);
            expect(config.giveUp.size.height).toBe(44);
        });

        test('should initialize with buttons disabled by default', () => {
            const state = (gameControlButtons: any4384.getButtonState() as ButtonState;
            
            expect(state.visibility.giveUp).toBe(false);
            expect(state.visibility.restart).toBe(false);
        });

        test('should detect device capabilities correctly', () => {
            const deviceInfo = (gameControlButtons: any4685.deviceInfo as DeviceInfo;
            expect(deviceInfo).toBeDefined();
            expect(typeof deviceInfo.isTouchDevice).toBe('boolean');
            expect(typeof deviceInfo.isMobile).toBe('boolean');
        });
    });

    describe('Button Positioning', () => {
        test('should calculate correct button positions with ResponsiveCanvasManager', () => {
            (gameControlButtons: any5089.updateButtonPositions();
            
            const config = (gameControlButtons: any5182.getButtonConfig() as ButtonConfigMap;
            
            // Check that positions are calculated
            expect(config.giveUp.position).toBeDefined();
            expect(config.restart.position).toBeDefined();
            expect(typeof config.giveUp.position!.x).toBe('number');
            expect(typeof config.giveUp.position!.y).toBe('number');
        });

        test('should handle missing ResponsiveCanvasManager gracefully', () => {
            gameEngine.responsiveCanvasManager = null;
            
            (gameControlButtons: any5741.updateButtonPositions();
            
            const config = (gameControlButtons: any5834.getButtonConfig() as ButtonConfigMap;
            expect(config.giveUp.position).toBeDefined();
            expect(config.restart.position).toBeDefined();
        });

        test('should scale button bounds correctly', () => {
            const bounds = (gameControlButtons: any6118.getButtonBounds('giveUp') as ButtonBounds;
            
            // With scale factor 1.5, width should be 120 * 1.5 = 180
            expect(bounds.width).toBe(180);
            expect(bounds.height).toBe(66); // 44 * 1.5
        });
    });

    describe('Button Visibility Control', () => {
        test('should show Give Up button only when game is started and not game over', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any6746.updateButtonVisibility(gameState);
            
            expect((gameControlButtons: any6841.isButtonVisible('giveUp')).toBe(true);
        });

        test('should hide Give Up button when game is over', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: true,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any7197.updateButtonVisibility(gameState);
            
            expect((gameControlButtons: any7292.isButtonVisible('giveUp')).toBe(false);
        });

        test('should show Restart button when game is started or game over', () => {
            // During game
            let gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any7691.updateButtonVisibility(gameState);
            expect((gameControlButtons: any7773.isButtonVisible('restart')).toBe(true);

            // Game over
            gameState = {
                isGameStarted: false,
                isGameOver: true,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any8058.updateButtonVisibility(gameState);
            expect((gameControlButtons: any8140.isButtonVisible('restart')).toBe(true);
        });

        test('should hide both buttons in pre-game state', () => {
            const gameState: GameState = {
                isGameStarted: false,
                isGameOver: false,
                isPaused: false,
                isPreGame: true
            };
            (gameControlButtons: any8496.updateButtonVisibility(gameState);
            
            expect((gameControlButtons: any8591.isButtonVisible('giveUp')).toBe(false);
            expect((gameControlButtons: any8678.isButtonVisible('restart')).toBe(false);
        });
    });

    describe('Click Detection', () => {
        beforeEach(() => {
            // Make buttons visible for click tests
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any9095.updateButtonVisibility(gameState);
        });

        test('should detect clicks within button bounds correctly', () => {
            // Mock button positions for predictable testing
            const buttonConfig = (gameControlButtons: any9341.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const isClicked = (gameControlButtons: any9507.isButtonClicked(150, 70, 'giveUp');
            expect(isClicked).toBe(true);
        });

        test('should reject clicks outside button bounds', () => {
            const buttonConfig = (gameControlButtons: any9726.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const isClicked = (gameControlButtons: any9892.isButtonClicked(50, 25, 'giveUp');
            expect(isClicked).toBe(false);
        });

        test('should handle click and return correct button type', () => {
            const buttonConfig = (gameControlButtons: any10119.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            buttonConfig.restart.position = { x: 100, y: 100 };
            
            const clickedButton = (gameControlButtons: any10353.handleClick(150, 70);
            expect(clickedButton).toBe('giveUp');
        });

        test('should ignore clicks when buttons are disabled', () => {
            (gameControlButtons: any10549.setButtonsEnabled(false);
            
            const clickedButton = (gameControlButtons: any10650.handleClick(150, 70);
            expect(clickedButton).toBeNull();
        });

        test('should ignore clicks on invisible buttons', () => {
            const gameState: GameState = {
                isGameStarted: false,
                isGameOver: false,
                isPaused: false,
                isPreGame: true
            };
            (gameControlButtons: any11033.updateButtonVisibility(gameState);
            
            const clickedButton = (gameControlButtons: any11143.handleClick(150, 70);
            expect(clickedButton).toBeNull();
        });
    });

    describe('Hover State Management', () => {
        beforeEach(() => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any11542.updateButtonVisibility(gameState);
        });

        test('should update hover state correctly', () => {
            const buttonConfig = (gameControlButtons: any11711.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            (gameControlButtons: any11859.updateMousePosition(150, 70);
            
            const state = (gameControlButtons: any11956.getButtonState() as ButtonState;
            expect(state.hoveredButton).toBe('giveUp');
        });

        test('should clear hover state when mouse leaves button area', () => {
            (gameControlButtons: any12177.updateMousePosition(50, 25);
            
            const state = (gameControlButtons: any12273.getButtonState() as ButtonState;
            expect(state.hoveredButton).toBeNull();
        });

        test('should clear keyboard focus when mouse is used', () => {
            (gameControlButtons: any12482.setKeyboardFocus('giveUp');
            (gameControlButtons: any12550.updateMousePosition(150, 70);
            
            const accessibilityState = (gameControlButtons: any12660.accessibilityState as AccessibilityState;
            expect(accessibilityState.focusedButton).toBeNull();
        });
    });

    describe('Keyboard Navigation', () => {
        beforeEach(() => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any13095.updateButtonVisibility(gameState);
        });

        test('should handle Tab navigation correctly', () => {
            const event: TouchEvent = {
                key: 'Tab',
                shiftKey: false,
                preventDefault: jest.fn()
            };
            
            const handled = (gameControlButtons: any13433.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(event.preventDefault!).toHaveBeenCalled();
        });

        test('should handle Enter key activation', () => {
            (gameControlButtons: any13693.setKeyboardFocus('giveUp');
            
            const event: TouchEvent = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            
            const handled = (gameControlButtons: any13930.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(uiManager.showConfirmationDialog).toHaveBeenCalledWith('giveUp');
        });

        test('should handle Space key activation', () => {
            (gameControlButtons: any14213.setKeyboardFocus('restart');
            
            const event: TouchEvent = {
                key: ' ',
                preventDefault: jest.fn()
            };
            
            const handled = (gameControlButtons: any14447.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(uiManager.showConfirmationDialog).toHaveBeenCalledWith('restart');
        });

        test('should clear focus on Escape key', () => {
            (gameControlButtons: any14729.setKeyboardFocus('giveUp');
            
            const event: TouchEvent = { key: 'Escape' };
            const handled = (gameControlButtons: any14883.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            const accessibilityState = (gameControlButtons: any15036.accessibilityState as AccessibilityState;
            expect(accessibilityState.focusedButton).toBeNull();
        });

        test('should cycle through visible buttons with Tab', () => {
            const visibleButtons = (gameControlButtons: any15289.getVisibleButtons() as string[];
            expect(visibleButtons).toContain('giveUp');
            expect(visibleButtons).toContain('restart');
            
            (gameControlButtons: any15488.navigateButtons(1, visibleButtons);
            const accessibilityState = (gameControlButtons: any15591.accessibilityState as AccessibilityState;
            expect(accessibilityState.focusedButton).toBe('giveUp');
            
            (gameControlButtons: any15755.navigateButtons(1, visibleButtons);
            expect(accessibilityState.focusedButton).toBe('restart');
        });
    });

    describe('Touch Handling', () => {
        beforeEach(() => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any16184.updateButtonVisibility(gameState);
        });

        test('should handle touch start correctly', () => {
            const buttonConfig = (gameControlButtons: any16353.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const touchedButton = (gameControlButtons: any16523.handleTouchStart(150, 70);
            
            expect(touchedButton).toBe('giveUp');
            const buttonState = (gameControlButtons: any16673.buttonState as ButtonState;
            expect(buttonState.activeButton).toBe('giveUp');
        });

        test('should handle touch end correctly when ending on same button', () => {
            const buttonConfig = (gameControlButtons: any16921.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            (gameControlButtons: any17056.handleTouchStart(150, 70);
            
            const completedButton = (gameControlButtons: any17160.handleTouchEnd(150, 70);
            
            expect(completedButton).toBe('giveUp');
            const buttonState = (gameControlButtons: any17310.buttonState as ButtonState;
            expect(buttonState.activeButton).toBeNull();
        });

        test('should cancel touch when ending outside button', () => {
            const buttonConfig = (gameControlButtons: any17540.buttonConfig as ButtonConfigMap;
            buttonConfig.giveUp.position = { x: 100, y: 50 };
            (gameControlButtons: any17675.handleTouchStart(150, 70);
            
            const completedButton = (gameControlButtons: any17779.handleTouchEnd(50, 25);
            
            expect(completedButton).toBeNull();
            const buttonState = (gameControlButtons: any17924.buttonState as ButtonState;
            expect(buttonState.activeButton).toBeNull();
        });

        test('should handle touch cancel correctly', () => {
            const buttonState = (gameControlButtons: any18143.buttonState as ButtonState;
            buttonState.activeButton = 'giveUp';
            
            (gameControlButtons: any18273.handleTouchCancel();
            
            expect(buttonState.activeButton).toBeNull();
        });
    });

    describe('Responsive Behavior', () => {
        test('should handle canvas size changes', () => {
            const buttonConfig = (gameControlButtons: any18548.buttonConfig as ButtonConfigMap;
            const originalPositions = { ...buttonConfig.giveUp.position };
            
            // Change canvas size
            mockCanvas.width = 1200;
            mockCanvas.height = 900;
            
            (gameControlButtons: any18830.updateButtonPositions();
            
            // Positions should be recalculated
            expect(buttonConfig.giveUp.position).not.toEqual(originalPositions);
        });

        test('should handle different scale factors', () => {
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue({
                baseWidth: 800,
                baseHeight: 600,
                scale: 2.0
            });
            
            const bounds = (gameControlButtons: any19320.getButtonBounds('giveUp') as ButtonBounds;
            
            // With scale factor 2.0, width should be 120 * 2.0 = 240
            expect(bounds.width).toBe(240);
            expect(bounds.height).toBe(88); // 44 * 2.0
        });
    });

    describe('Rendering', () => {
        let mockContext: MockRenderingContext;

        beforeEach(() => {
            mockContext = {
                save: jest.fn(),
                restore: jest.fn(),
                fillRect: jest.fn(),
                strokeRect: jest.fn(),
                fillText: jest.fn(),
                createLinearGradient: jest.fn(() => ({
                    addColorStop: jest.fn()
                })),
                setLineDash: jest.fn(),
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
            };
        });

        test('should render visible buttons only', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any20685.updateButtonVisibility(gameState);
            
            (gameControlButtons: any20773.render(mockContext);
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('should not render when buttons are disabled', () => {
            (gameControlButtons: any21045.setButtonsEnabled(false);
            
            (gameControlButtons: any21124.render(mockContext);
            
            expect(mockContext.save).not.toHaveBeenCalled();
        });

        test('should render focus indicator for keyboard navigation', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any21546.updateButtonVisibility(gameState);
            (gameControlButtons: any21621.setKeyboardFocus('giveUp');
            
            (gameControlButtons: any21702.render(mockContext);
            
            expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 3]);
        });

        test('should render touch feedback for active buttons', () => {
            const gameState: GameState = {
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            };
            (gameControlButtons: any22131.updateButtonVisibility(gameState);
            const buttonState = (gameControlButtons: any22226.buttonState as ButtonState;
            buttonState.activeButton = 'giveUp';
            
            (gameControlButtons: any22356.render(mockContext);
            
            expect(mockContext.createLinearGradient).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        test('should provide complete button state', () => {
            const state = (gameControlButtons: any22640.getButtonState() as ButtonState;
            
            expect(state).toHaveProperty('enabled');
            expect(state).toHaveProperty('hoveredButton');
            expect(state).toHaveProperty('activeButton');
            expect(state).toHaveProperty('visibility');
            expect(state.visibility).toHaveProperty('giveUp');
            expect(state.visibility).toHaveProperty('restart');
        });

        test('should provide complete button configuration', () => {
            const config = (gameControlButtons: any23176.getButtonConfig() as ButtonConfigMap;
            
            expect(config).toHaveProperty('giveUp');
            expect(config).toHaveProperty('restart');
            expect(config.giveUp).toHaveProperty('text');
            expect(config.giveUp).toHaveProperty('size');
            expect(config.giveUp).toHaveProperty('style');
        });
    });
});