/**
 * Unit tests for GameControlButtons component
 * Tests button rendering, click detection, responsive positioning, 
 * accessibility features, and mobile touch handling
 */

import { GameControlButtons } from '../../src/scenes/game-scene/GameControlButtons.js';

describe('GameControlButtons', () => {
    let gameEngine;
    let uiManager;
    let gameControlButtons;
    let mockCanvas;
    let mockResponsiveCanvasManager;

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
            getScaledCoordinates: jest.fn((x, y) => ({
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

        gameControlButtons = new GameControlButtons(gameEngine, uiManager);
    });

    describe('Initialization', () => {
        it('should initialize with correct default configuration', () => {
            const config = gameControlButtons.getButtonConfig();
            
            expect(config.giveUp).toBeDefined();
            expect(config.restart).toBeDefined();
            expect(config.giveUp.text).toBe('ギブアップ');
            expect(config.restart.text).toBe('ゲーム再開始');
            expect(config.giveUp.size.width).toBe(120);
            expect(config.giveUp.size.height).toBe(44);
        });

        it('should initialize with buttons disabled by default', () => {
            const state = gameControlButtons.getButtonState();
            
            expect(state.visibility.giveUp).toBe(false);
            expect(state.visibility.restart).toBe(false);
        });

        it('should detect device capabilities correctly', () => {
            expect(gameControlButtons.deviceInfo).toBeDefined();
            expect(typeof gameControlButtons.deviceInfo.isTouchDevice).toBe('boolean');
            expect(typeof gameControlButtons.deviceInfo.isMobile).toBe('boolean');
        });
    });

    describe('Button Positioning', () => {
        it('should calculate correct button positions with ResponsiveCanvasManager', () => {
            gameControlButtons.updateButtonPositions();
            
            const config = gameControlButtons.getButtonConfig();
            
            // Check that positions are calculated
            expect(config.giveUp.position).toBeDefined();
            expect(config.restart.position).toBeDefined();
            expect(typeof config.giveUp.position.x).toBe('number');
            expect(typeof config.giveUp.position.y).toBe('number');
        });

        it('should handle missing ResponsiveCanvasManager gracefully', () => {
            gameEngine.responsiveCanvasManager = null;
            
            gameControlButtons.updateButtonPositions();
            
            const config = gameControlButtons.getButtonConfig();
            expect(config.giveUp.position).toBeDefined();
            expect(config.restart.position).toBeDefined();
        });

        it('should scale button bounds correctly', () => {
            const bounds = gameControlButtons.getButtonBounds('giveUp');
            
            // With scale factor 1.5, width should be 120 * 1.5 = 180
            expect(bounds.width).toBe(180);
            expect(bounds.height).toBe(66); // 44 * 1.5
        });
    });

    describe('Button Visibility Control', () => {
        it('should show Give Up button only when game is started and not game over', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
            
            expect(gameControlButtons.isButtonVisible('giveUp')).toBe(true);
        });

        it('should hide Give Up button when game is over', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: true,
                isPaused: false,
                isPreGame: false
            });
            
            expect(gameControlButtons.isButtonVisible('giveUp')).toBe(false);
        });

        it('should show Restart button when game is started or game over', () => {
            // During game
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
            expect(gameControlButtons.isButtonVisible('restart')).toBe(true);

            // Game over
            gameControlButtons.updateButtonVisibility({
                isGameStarted: false,
                isGameOver: true,
                isPaused: false,
                isPreGame: false
            });
            expect(gameControlButtons.isButtonVisible('restart')).toBe(true);
        });

        it('should hide both buttons in pre-game state', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: false,
                isGameOver: false,
                isPaused: false,
                isPreGame: true
            });
            
            expect(gameControlButtons.isButtonVisible('giveUp')).toBe(false);
            expect(gameControlButtons.isButtonVisible('restart')).toBe(false);
        });
    });

    describe('Click Detection', () => {
        beforeEach(() => {
            // Make buttons visible for click tests
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
        });

        it('should detect clicks within button bounds correctly', () => {
            // Mock button positions for predictable testing
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const isClicked = gameControlButtons.isButtonClicked(150, 70, 'giveUp');
            expect(isClicked).toBe(true);
        });

        it('should reject clicks outside button bounds', () => {
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const isClicked = gameControlButtons.isButtonClicked(50, 25, 'giveUp');
            expect(isClicked).toBe(false);
        });

        it('should handle click and return correct button type', () => {
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            gameControlButtons.buttonConfig.restart.position = { x: 100, y: 100 };
            
            const clickedButton = gameControlButtons.handleClick(150, 70);
            expect(clickedButton).toBe('giveUp');
        });

        it('should ignore clicks when buttons are disabled', () => {
            gameControlButtons.setButtonsEnabled(false);
            
            const clickedButton = gameControlButtons.handleClick(150, 70);
            expect(clickedButton).toBeNull();
        });

        it('should ignore clicks on invisible buttons', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: false,
                isGameOver: false,
                isPaused: false,
                isPreGame: true
            });
            
            const clickedButton = gameControlButtons.handleClick(150, 70);
            expect(clickedButton).toBeNull();
        });
    });

    describe('Hover State Management', () => {
        beforeEach(() => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
        });

        it('should update hover state correctly', () => {
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            gameControlButtons.updateMousePosition(150, 70);
            
            const state = gameControlButtons.getButtonState();
            expect(state.hoveredButton).toBe('giveUp');
        });

        it('should clear hover state when mouse leaves button area', () => {
            gameControlButtons.updateMousePosition(50, 25);
            
            const state = gameControlButtons.getButtonState();
            expect(state.hoveredButton).toBeNull();
        });

        it('should clear keyboard focus when mouse is used', () => {
            gameControlButtons.setKeyboardFocus('giveUp');
            gameControlButtons.updateMousePosition(150, 70);
            
            expect(gameControlButtons.accessibilityState.focusedButton).toBeNull();
        });
    });

    describe('Keyboard Navigation', () => {
        beforeEach(() => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
        });

        it('should handle Tab navigation correctly', () => {
            const event = {
                key: 'Tab',
                shiftKey: false,
                preventDefault: jest.fn()
            };
            
            const handled = gameControlButtons.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should handle Enter key activation', () => {
            gameControlButtons.setKeyboardFocus('giveUp');
            
            const event = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            
            const handled = gameControlButtons.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(uiManager.showConfirmationDialog).toHaveBeenCalledWith('giveUp');
        });

        it('should handle Space key activation', () => {
            gameControlButtons.setKeyboardFocus('restart');
            
            const event = {
                key: ' ',
                preventDefault: jest.fn()
            };
            
            const handled = gameControlButtons.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(uiManager.showConfirmationDialog).toHaveBeenCalledWith('restart');
        });

        it('should clear focus on Escape key', () => {
            gameControlButtons.setKeyboardFocus('giveUp');
            
            const event = { key: 'Escape' };
            const handled = gameControlButtons.handleKeyboardNavigation(event);
            
            expect(handled).toBe(true);
            expect(gameControlButtons.accessibilityState.focusedButton).toBeNull();
        });

        it('should cycle through visible buttons with Tab', () => {
            const visibleButtons = gameControlButtons.getVisibleButtons();
            expect(visibleButtons).toContain('giveUp');
            expect(visibleButtons).toContain('restart');
            
            gameControlButtons.navigateButtons(1, visibleButtons);
            expect(gameControlButtons.accessibilityState.focusedButton).toBe('giveUp');
            
            gameControlButtons.navigateButtons(1, visibleButtons);
            expect(gameControlButtons.accessibilityState.focusedButton).toBe('restart');
        });
    });

    describe('Touch Handling', () => {
        beforeEach(() => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
        });

        it('should handle touch start correctly', () => {
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            
            const touchedButton = gameControlButtons.handleTouchStart(150, 70);
            
            expect(touchedButton).toBe('giveUp');
            expect(gameControlButtons.buttonState.activeButton).toBe('giveUp');
        });

        it('should handle touch end correctly when ending on same button', () => {
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            gameControlButtons.handleTouchStart(150, 70);
            
            const completedButton = gameControlButtons.handleTouchEnd(150, 70);
            
            expect(completedButton).toBe('giveUp');
            expect(gameControlButtons.buttonState.activeButton).toBeNull();
        });

        it('should cancel touch when ending outside button', () => {
            gameControlButtons.buttonConfig.giveUp.position = { x: 100, y: 50 };
            gameControlButtons.handleTouchStart(150, 70);
            
            const completedButton = gameControlButtons.handleTouchEnd(50, 25);
            
            expect(completedButton).toBeNull();
            expect(gameControlButtons.buttonState.activeButton).toBeNull();
        });

        it('should handle touch cancel correctly', () => {
            gameControlButtons.buttonState.activeButton = 'giveUp';
            
            gameControlButtons.handleTouchCancel();
            
            expect(gameControlButtons.buttonState.activeButton).toBeNull();
        });
    });

    describe('Responsive Behavior', () => {
        it('should handle canvas size changes', () => {
            const originalPositions = { ...gameControlButtons.buttonConfig.giveUp.position };
            
            // Change canvas size
            mockCanvas.width = 1200;
            mockCanvas.height = 900;
            
            gameControlButtons.updateButtonPositions();
            
            // Positions should be recalculated
            expect(gameControlButtons.buttonConfig.giveUp.position).not.toEqual(originalPositions);
        });

        it('should handle different scale factors', () => {
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue({
                baseWidth: 800,
                baseHeight: 600,
                scale: 2.0
            });
            
            const bounds = gameControlButtons.getButtonBounds('giveUp');
            
            // With scale factor 2.0, width should be 120 * 2.0 = 240
            expect(bounds.width).toBe(240);
            expect(bounds.height).toBe(88); // 44 * 2.0
        });
    });

    describe('Rendering', () => {
        let mockContext;

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

        it('should render visible buttons only', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
            
            gameControlButtons.render(mockContext);
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        it('should not render when buttons are disabled', () => {
            gameControlButtons.setButtonsEnabled(false);
            
            gameControlButtons.render(mockContext);
            
            expect(mockContext.save).not.toHaveBeenCalled();
        });

        it('should render focus indicator for keyboard navigation', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
            gameControlButtons.setKeyboardFocus('giveUp');
            
            gameControlButtons.render(mockContext);
            
            expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 3]);
        });

        it('should render touch feedback for active buttons', () => {
            gameControlButtons.updateButtonVisibility({
                isGameStarted: true,
                isGameOver: false,
                isPaused: false,
                isPreGame: false
            });
            gameControlButtons.buttonState.activeButton = 'giveUp';
            
            gameControlButtons.render(mockContext);
            
            expect(mockContext.createLinearGradient).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        it('should provide complete button state', () => {
            const state = gameControlButtons.getButtonState();
            
            expect(state).toHaveProperty('enabled');
            expect(state).toHaveProperty('hoveredButton');
            expect(state).toHaveProperty('activeButton');
            expect(state).toHaveProperty('visibility');
            expect(state.visibility).toHaveProperty('giveUp');
            expect(state.visibility).toHaveProperty('restart');
        });

        it('should provide complete button configuration', () => {
            const config = gameControlButtons.getButtonConfig();
            
            expect(config).toHaveProperty('giveUp');
            expect(config).toHaveProperty('restart');
            expect(config.giveUp).toHaveProperty('text');
            expect(config.giveUp).toHaveProperty('size');
            expect(config.giveUp).toHaveProperty('style');
        });
    });
});