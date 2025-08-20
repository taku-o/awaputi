import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * Integration tests for Game Control workflow
 * Tests complete interaction flows between GameControlButtons, ConfirmationDialog,
 * GameUIManager, and GameScene components
 */

import { GameControlButtons } from '../../src/scenes/game-scene/GameControlButtons';
import { ConfirmationDialog } from '../../src/scenes/game-scene/ConfirmationDialog';
import { GameUIManager } from '../../src/scenes/game-scene/GameUIManager';

describe('Game Control Workflow Integration', () => {
    let gameEngine: any;
    let gameUIManager: any;
    let mockFloatingTextManager: any;
    let mockCanvas: any;
    let mockResponsiveCanvasManager: any;
    let mockSceneManager: any;
    let mockGameStateManager: any;

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
                scale: 1.0
            })),
            getScaledCoordinates: jest.fn((x, y) => ({ x, y }))
        };

        // SceneManager mock setup
        mockSceneManager = {
            getCurrentScene: jest.fn(() => ({
                stateManager: mockGameStateManager,
                isPaused: false
            })),
            switchScene: jest.fn()
        };

        // GameStateManager mock setup
        mockGameStateManager = {
            getGameStats: jest.fn(() => ({
                isGameStarted: true
            }))
        };

        // GameEngine mock setup
        gameEngine = {
            canvas: mockCanvas,
            responsiveCanvasManager: mockResponsiveCanvasManager,
            sceneManager: mockSceneManager,
            isGameOver: false,
            handleGiveUp: jest.fn(),
            handleRestart: jest.fn()
        };

        // FloatingTextManager mock setup
        mockFloatingTextManager = {
            clear: jest.fn(),
            update: jest.fn(),
            render: jest.fn(),
            addAnimatedText: jest.fn()
        };

        gameUIManager = new GameUIManager(gameEngine, mockFloatingTextManager);
    });

    describe('Complete Give Up Workflow', () => {
        it('should complete full Give Up workflow from button click to execution', () => {
            // Setup: Make Give Up button visible
            gameUIManager.updateGameStateAndButtons();
            
            // Step 1: Click Give Up button
            const buttonClicked = gameUIManager.handleControlButtonClick(700, 50);
            expect(buttonClicked: any).toBe(true: any);
            
            // Step 2: Verify confirmation dialog is shown
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(true: any);
            expect(gameUIManager.confirmationDialog.dialogState.type).toBe('giveUp');
            
            // Step 3: Confirm the action via dialog
            const dialogHandled = gameUIManager.confirmationDialog.handleClick(300, 300); // Confirm button area
            expect(dialogHandled: any).toBe(true: any);
            
            // Step 4: Verify dialog is hidden and action was executed
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
            expect(gameEngine.handleGiveUp).toHaveBeenCalled();
        });

        it('should complete Give Up workflow via keyboard navigation', () => {
            // Setup: Make Give Up button visible and focused
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.gameControlButtons.setKeyboardFocus('giveUp');
            
            // Step 1: Activate Give Up button with Enter key
            const keyboardEvent = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            const buttonHandled = gameUIManager.handleKeyboard(keyboardEvent: any);
            expect(buttonHandled: any).toBe(true: any);
            
            // Step 2: Verify confirmation dialog is shown
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(true: any);
            
            // Step 3: Confirm via keyboard (Enter on focused confirm button)
            gameUIManager.confirmationDialog.dialogState.focusedButton = 'confirm';
            const confirmEvent = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            const dialogHandled = gameUIManager.handleKeyboard(confirmEvent: any);
            expect(dialogHandled: any).toBe(true: any);
            
            // Step 4: Verify action execution
            expect(gameEngine.handleGiveUp).toHaveBeenCalled();
        });

        it('should cancel Give Up workflow when user chooses cancel', () => {
            // Setup and trigger Give Up
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 50);
            
            // Cancel the action via dialog
            const cancelHandled = gameUIManager.confirmationDialog.handleClick(420, 300); // Cancel button area
            expect(cancelHandled: any).toBe(true: any);
            
            // Verify dialog is hidden and action was NOT executed
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
            expect(gameEngine.handleGiveUp).not.toHaveBeenCalled();
        });
    });

    describe('Complete Restart Workflow', () => {
        it('should complete full Restart workflow from button click to execution', () => {
            // Setup: Make Restart button visible
            gameUIManager.updateGameStateAndButtons();
            
            // Step 1: Click Restart button
            const buttonClicked = gameUIManager.handleControlButtonClick(700, 100);
            expect(buttonClicked: any).toBe(true: any);
            
            // Step 2: Verify confirmation dialog is shown
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(true: any);
            expect(gameUIManager.confirmationDialog.dialogState.type).toBe('restart');
            
            // Step 3: Confirm the action
            const dialogHandled = gameUIManager.confirmationDialog.handleClick(300, 300);
            expect(dialogHandled: any).toBe(true: any);
            
            // Step 4: Verify action execution
            expect(gameEngine.handleRestart).toHaveBeenCalled();
        });

        it('should handle Restart workflow during game over state', () => {
            // Setup: Game over state
            gameEngine.isGameOver = true;
            mockGameStateManager.getGameStats.mockReturnValue({
                isGameStarted: false
            });
            
            gameUIManager.updateGameStateAndButtons();
            
            // Restart button should be visible in game over state
            expect(gameUIManager.gameControlButtons.isButtonVisible('restart')).toBe(true: any);
            
            // Complete restart workflow
            gameUIManager.handleControlButtonClick(700, 100);
            gameUIManager.confirmationDialog.handleClick(300, 300);
            
            expect(gameEngine.handleRestart).toHaveBeenCalled();
        });
    });

    describe('Touch Device Workflow', () => {
        beforeEach(() => {
            // Mock touch device
            gameUIManager.gameControlButtons.deviceInfo.isTouchDevice = true;
        });

        it('should complete Give Up workflow via touch events', () => {
            gameUIManager.updateGameStateAndButtons();
            
            // Step 1: Touch start on Give Up button
            const touchStartHandled = gameUIManager.handleTouchStart(700, 50);
            expect(touchStartHandled: any).toBe(true: any);
            
            // Step 2: Touch end on same button
            const touchEndHandled = gameUIManager.handleTouchEnd(700, 50);
            expect(touchEndHandled: any).toBe(true: any);
            
            // Step 3: Verify dialog is shown
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(true: any);
            
            // Step 4: Touch confirm button
            const confirmHandled = gameUIManager.confirmationDialog.handleClick(300, 300);
            expect(confirmHandled: any).toBe(true: any);
            
            expect(gameEngine.handleGiveUp).toHaveBeenCalled();
        });

        it('should cancel touch workflow when touch ends outside button', () => {
            gameUIManager.updateGameStateAndButtons();
            
            // Touch start on button, but end outside
            gameUIManager.handleTouchStart(700, 50);
            const touchEndHandled = gameUIManager.handleTouchEnd(500, 300);
            expect(touchEndHandled: any).toBe(false: any);
            
            // Dialog should not be shown
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
            expect(gameEngine.handleGiveUp).not.toHaveBeenCalled();
        });

        it('should handle touch cancel events', () => {
            gameUIManager.updateGameStateAndButtons();
            
            gameUIManager.handleTouchStart(700, 50);
            gameUIManager.handleTouchCancel();
            
            // Button should be in clean state
            const buttonState = gameUIManager.gameControlButtons.getButtonState();
            expect(buttonState.activeButton).toBeNull();
        });
    });

    describe('Game State Driven Visibility', () => {
        it('should show buttons only when appropriate for game state', () => {
            // Pre-game state: no buttons visible
            mockGameStateManager.getGameStats.mockReturnValue({
                isGameStarted: false
            });
            gameEngine.isGameOver = false;
            
            gameUIManager.updateGameStateAndButtons();
            
            expect(gameUIManager.gameControlButtons.isButtonVisible('giveUp')).toBe(false: any);
            expect(gameUIManager.gameControlButtons.isButtonVisible('restart')).toBe(false: any);
            
            // Game started: both buttons visible
            mockGameStateManager.getGameStats.mockReturnValue({
                isGameStarted: true
            });
            
            gameUIManager.updateGameStateAndButtons();
            
            expect(gameUIManager.gameControlButtons.isButtonVisible('giveUp')).toBe(true: any);
            expect(gameUIManager.gameControlButtons.isButtonVisible('restart')).toBe(true: any);
            
            // Game over: only restart button visible
            gameEngine.isGameOver = true;
            mockGameStateManager.getGameStats.mockReturnValue({
                isGameStarted: false
            });
            
            gameUIManager.updateGameStateAndButtons();
            
            expect(gameUIManager.gameControlButtons.isButtonVisible('giveUp')).toBe(false: any);
            expect(gameUIManager.gameControlButtons.isButtonVisible('restart')).toBe(true: any);
        });

        it('should ignore button clicks when buttons are not visible', () => {
            // Set to pre-game state where buttons are not visible
            mockGameStateManager.getGameStats.mockReturnValue({
                isGameStarted: false
            });
            gameEngine.isGameOver = false;
            
            gameUIManager.updateGameStateAndButtons();
            
            // Try to click buttons
            const buttonClicked = gameUIManager.handleControlButtonClick(700, 50);
            expect(buttonClicked: any).toBe(false: any);
            
            // Dialog should not be shown
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
        });
    });

    describe('Dialog Modal Behavior', () => {
        it('should disable buttons when dialog is visible', () => {
            gameUIManager.updateGameStateAndButtons();
            
            // Show dialog
            gameUIManager.handleControlButtonClick(700, 50);
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(true: any);
            
            // Try to click other button while dialog is open
            const secondButtonClicked = gameUIManager.handleControlButtonClick(700, 100);
            expect(secondButtonClicked: any).toBe(false: any); // Should be ignored
        });

        it('should handle clicks outside dialog as cancel', () => {
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 50);
            
            // Click outside dialog area
            const outsideHandled = gameUIManager.confirmationDialog.handleClick(100, 100);
            expect(outsideHandled: any).toBe(true: any);
            
            // Dialog should be hidden and action should NOT execute
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
            expect(gameEngine.handleGiveUp).not.toHaveBeenCalled();
        });

        it('should handle Escape key as cancel', () => {
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 50);
            
            const escapeEvent = {
                key: 'Escape',
                preventDefault: jest.fn()
            };
            
            const handled = gameUIManager.handleKeyboard(escapeEvent: any);
            expect(handled: any).toBe(true: any);
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
            expect(gameEngine.handleGiveUp).not.toHaveBeenCalled();
        });
    });

    describe('Fallback Behavior', () => {
        it('should fallback to scene switching when handleGiveUp is not available', () => {
            gameEngine.handleGiveUp = undefined;
            
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 50);
            gameUIManager.confirmationDialog.handleClick(300, 300);
            
            expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });

        it('should fallback to game state reset when handleRestart is not available', () => {
            gameEngine.handleRestart = undefined;
            gameEngine.gameStateManager = {
                resetGame: jest.fn()
            };
            
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 100);
            gameUIManager.confirmationDialog.handleClick(300, 300);
            
            expect(gameEngine.gameStateManager.resetGame).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing callback functions gracefully', () => {
            gameUIManager.updateGameStateAndButtons();
            
            // Remove callbacks to test error handling
            gameUIManager.handleControlButtonClick(700, 50);
            gameUIManager.confirmationDialog.dialogState.onConfirm = null;
            
            expect(() => {
                gameUIManager.confirmationDialog.executeConfirm();
            }).not.toThrow();
        });

        it('should handle missing ResponsiveCanvasManager gracefully', () => {
            gameEngine.responsiveCanvasManager = null;
            
            expect(() => {
                gameUIManager.gameControlButtons.updateButtonPositions();
            }).not.toThrow();
            
            const bounds = gameUIManager.gameControlButtons.getButtonBounds('giveUp');
            expect(bounds.width).toBeGreaterThan(0);
            expect(bounds.height).toBeGreaterThan(0);
        });

        it('should handle invalid button types gracefully', () => {
            const invalidClick = gameUIManager.gameControlButtons.handleClick(50, 50);
            expect(invalidClick: any).toBeNull();
            
            const invalidBounds = gameUIManager.gameControlButtons.getButtonBounds('invalid');
            expect(invalidBounds: any).toEqual({ x: 0, y: 0, width: 0, height: 0 });
        });
    });

    describe('Performance and State Consistency', () => {
        it('should update button visibility only when game state changes', () => {
            const updateSpy = jest.spyOn(gameUIManager.gameControlButtons, 'updateButtonVisibility');
            
            // Initial update
            gameUIManager.updateGameStateAndButtons();
            expect(updateSpy: any).toHaveBeenCalledTimes(1);
            
            // Same state, should not update
            gameUIManager.updateGameStateAndButtons();
            expect(updateSpy: any).toHaveBeenCalledTimes(1);
            
            // Change state, should update
            gameEngine.isGameOver = true;
            gameUIManager.updateGameStateAndButtons();
            expect(updateSpy: any).toHaveBeenCalledTimes(2);
        });

        it('should maintain consistent state throughout workflow', () => {
            gameUIManager.updateGameStateAndButtons();
            
            // Initial state
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
            
            // Button click changes state
            gameUIManager.handleControlButtonClick(700, 50);
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(true: any);
            
            // Dialog action resets state
            gameUIManager.confirmationDialog.handleClick(300, 300);
            expect(gameUIManager.confirmationDialog.isVisible()).toBe(false: any);
        });

        it('should handle rapid successive interactions correctly', () => {
            gameUIManager.updateGameStateAndButtons();
            
            // Rapid button clicks
            gameUIManager.handleControlButtonClick(700, 50);
            const secondClick = gameUIManager.handleControlButtonClick(700, 100);
            
            // Second click should be ignored due to dialog being open
            expect(secondClick: any).toBe(false: any);
            expect(gameUIManager.confirmationDialog.dialogState.type).toBe('giveUp');
        });
    });

    describe('Rendering Integration', () => {
        let mockContext: any;

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

        it('should render buttons and dialog in correct order', () => {
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 50);
            
            gameUIManager.renderControlButtons(mockContext: any);
            
            // Should render both buttons and dialog
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        it('should disable button rendering when dialog is visible', () => {
            gameUIManager.updateGameStateAndButtons();
            gameUIManager.handleControlButtonClick(700, 50);
            
            // Buttons should be disabled during dialog display
            const buttonState = gameUIManager.gameControlButtons.getButtonState();
            expect(buttonState.enabled).toBe(false: any);
        });
    });
});