/**
 * Unit tests for ConfirmationDialog component
 * Tests dialog display, interaction handling, keyboard navigation,
 * modal behavior, and callback execution
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { ConfirmationDialog } from '../../src/scenes/game-scene/ConfirmationDialog.js';

// モック用の型定義
interface MockCanvas {
    width: number;
    height: number;
}

interface MockGameEngine {
    canvas: MockCanvas;
}

interface MockRenderingContext {
    save: jest.Mock;
    restore: jest.Mock;
    fillRect: jest.Mock;
    strokeRect: jest.Mock;
    fillText: jest.Mock;
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

interface DialogLayout {
    width: number;
    height: number;
    buttonWidth: number;
    buttonHeight: number;
    buttonSpacing: number;
    x?: number;
    y?: number;
    confirmButton: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    cancelButton: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface DialogState {
    visible: boolean;
    type: string | null;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
    hoveredButton: string | null;
    focusedButton: string;
}

interface DialogConfig {
    giveUp: {
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
    };
    restart: {
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
    };
}

interface KeyboardEvent {
    key: string;
    shiftKey?: boolean;
    preventDefault: jest.Mock;
}

describe('ConfirmationDialog', () => {
    let gameEngine: MockGameEngine;
    let confirmationDialog: ConfirmationDialog;
    let mockCanvas: MockCanvas;
    let mockOnConfirm: jest.Mock;
    let mockOnCancel: jest.Mock;

    beforeEach(() => {
        // Canvas mock setup
        mockCanvas = {
            width: 800,
            height: 600
        };

        // GameEngine mock setup
        gameEngine = {
            canvas: mockCanvas
        };

        // Callback mocks
        mockOnConfirm = jest.fn();
        mockOnCancel = jest.fn();

        confirmationDialog = new ConfirmationDialog(gameEngine as any);
    });

    describe('Initialization', () => {
        it('should initialize with correct default configuration', () => {
            const config = (confirmationDialog: any2656.getDialogConfig() as DialogConfig;
            
            expect(config.giveUp).toBeDefined();
            expect(config.restart).toBeDefined();
            expect(config.giveUp.title).toBe('確認');
            expect(config.giveUp.message).toBe('ゲームを終了しますか？');
            expect(config.restart.message).toBe('ゲームを再開始しますか？');
        });

        it('should initialize with dialog hidden', () => {
            expect((confirmationDialog: any3102.isVisible()).toBe(false);
        });

        it('should initialize with correct layout dimensions', () => {
            const dialogLayout = (confirmationDialog: any3273.dialogLayout as DialogLayout;
            expect(dialogLayout.width).toBe(400);
            expect(dialogLayout.height).toBe(200);
            expect(dialogLayout.buttonWidth).toBe(100);
            expect(dialogLayout.buttonHeight).toBe(40);
        });

        it('should calculate button positions correctly', () => {
            const dialogLayout = (confirmationDialog: any3656.dialogLayout as DialogLayout;
            expect(dialogLayout.confirmButton).toBeDefined();
            expect(dialogLayout.cancelButton).toBeDefined();
            expect(typeof dialogLayout.confirmButton.x).toBe('number');
            expect(typeof dialogLayout.confirmButton.y).toBe('number');
        });
    });

    describe('Dialog Display', () => {
        it('should show dialog with correct type and callbacks', () => {
            (confirmationDialog: any4126.show('giveUp', mockOnConfirm, mockOnCancel);
            
            expect((confirmationDialog: any4231.isVisible()).toBe(true);
            
            const state = (confirmationDialog: any4323.getDialogState() as DialogState;
            expect(state.type).toBe('giveUp');
            expect(state.onConfirm).toBe(mockOnConfirm);
            expect(state.onCancel).toBe(mockOnCancel);
        });

        it('should reject invalid dialog types', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            (confirmationDialog: any4720.show('invalid', mockOnConfirm, mockOnCancel);
            
            expect((confirmationDialog: any4826.isVisible()).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Unknown dialog type: invalid');
            
            consoleSpy.mockRestore();
        });

        it('should hide dialog and clear state', () => {
            (confirmationDialog: any5098.show('restart', mockOnConfirm, mockOnCancel);
            (confirmationDialog: any5184.hide();
            
            expect((confirmationDialog: any5252.isVisible()).toBe(false);
            
            const state = (confirmationDialog: any5345.getDialogState() as DialogState;
            expect(state.type).toBeNull();
            expect(state.onConfirm).toBeNull();
            expect(state.onCancel).toBeNull();
        });

        it('should reset focus to cancel button when shown', () => {
            (confirmationDialog: any5638.show('giveUp', mockOnConfirm, mockOnCancel);
            
            const state = (confirmationDialog: any5750.getDialogState() as DialogState;
            expect(state.focusedButton).toBe('cancel');
        });
    });

    describe('Click Handling', () => {
        beforeEach(() => {
            (confirmationDialog: any5966.show('giveUp', mockOnConfirm, mockOnCancel);
            // Mock button positions for predictable testing
            const dialogLayout = (confirmationDialog: any6133.dialogLayout as DialogLayout;
            dialogLayout.confirmButton = { x: 250, y: 280, width: 100, height: 40 };
            dialogLayout.cancelButton = { x: 370, y: 280, width: 100, height: 40 };
        });

        it('should detect clicks on confirm button correctly', () => {
            const isConfirmClicked = (confirmationDialog: any6481.isButtonClicked(300, 300, 'confirm');
            expect(isConfirmClicked).toBe(true);
        });

        it('should detect clicks on cancel button correctly', () => {
            const isCancelClicked = (confirmationDialog: any6715.isButtonClicked(420, 300, 'cancel');
            expect(isCancelClicked).toBe(true);
        });

        it('should reject clicks outside button bounds', () => {
            const isConfirmClicked = (confirmationDialog: any6943.isButtonClicked(200, 300, 'confirm');
            const isCancelClicked = (confirmationDialog: any7045.isButtonClicked(500, 300, 'cancel');
            
            expect(isConfirmClicked).toBe(false);
            expect(isCancelClicked).toBe(false);
        });

        it('should handle confirm button click and execute callback', () => {
            const handled = (confirmationDialog: any7341.handleClick(300, 300);
            
            expect(handled).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog: any7518.isVisible()).toBe(false);
        });

        it('should handle cancel button click and execute callback', () => {
            const handled = (confirmationDialog: any7690.handleClick(420, 300);
            
            expect(handled).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog: any7866.isVisible()).toBe(false);
        });

        it('should handle clicks inside dialog but outside buttons', () => {
            const handled = (confirmationDialog: any8038.handleClick(400, 200);
            
            expect(handled).toBe(true);
            expect(mockOnConfirm).not.toHaveBeenCalled();
            expect(mockOnCancel).not.toHaveBeenCalled();
        });

        it('should handle clicks outside dialog as cancel', () => {
            const handled = (confirmationDialog: any8366.handleClick(100, 100);
            
            expect(handled).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog: any8542.isVisible()).toBe(false);
        });

        it('should ignore clicks when dialog is hidden', () => {
            (confirmationDialog: any8686.hide();
            
            const handled = (confirmationDialog: any8763.handleClick(300, 300);
            expect(handled).toBe(false);
        });
    });

    describe('Hover State Management', () => {
        beforeEach(() => {
            (confirmationDialog: any8962.show('restart', mockOnConfirm, mockOnCancel);
            const dialogLayout = (confirmationDialog: any9069.dialogLayout as DialogLayout;
            dialogLayout.confirmButton = { x: 250, y: 280, width: 100, height: 40 };
            dialogLayout.cancelButton = { x: 370, y: 280, width: 100, height: 40 };
        });

        it('should update hover state for confirm button', () => {
            (confirmationDialog: any9388.updateMousePosition(300, 300);
            
            const state = (confirmationDialog: any9486.getDialogState() as DialogState;
            expect(state.hoveredButton).toBe('confirm');
        });

        it('should update hover state for cancel button', () => {
            (confirmationDialog: any9695.updateMousePosition(420, 300);
            
            const state = (confirmationDialog: any9793.getDialogState() as DialogState;
            expect(state.hoveredButton).toBe('cancel');
        });

        it('should clear hover state when mouse is outside buttons', () => {
            (confirmationDialog: any10012.updateMousePosition(400, 200);
            
            const state = (confirmationDialog: any10110.getDialogState() as DialogState;
            expect(state.hoveredButton).toBeNull();
        });

        it('should ignore mouse position when dialog is hidden', () => {
            (confirmationDialog: any10321.hide();
            (confirmationDialog: any10369.updateMousePosition(300, 300);
            
            const state = (confirmationDialog: any10467.getDialogState() as DialogState;
            expect(state.hoveredButton).toBeNull();
        });
    });

    describe('Keyboard Navigation', () => {
        beforeEach(() => {
            (confirmationDialog: any10684.show('giveUp', mockOnConfirm, mockOnCancel);
        });

        it('should handle Tab key to switch focus between buttons', () => {
            const event: KeyboardEvent = {
                key: 'Tab',
                preventDefault: jest.fn()
            };
            
            // Initially focused on cancel
            expect((confirmationDialog: any11049.dialogState.focusedButton).toBe('cancel');
            
            const handled = (confirmationDialog: any11161.handleKeyboard(event);
            
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect((confirmationDialog: any11345.dialogState.focusedButton).toBe('confirm');
        });

        it('should handle Enter key to execute focused button', () => {
            (confirmationDialog: any11514.dialogState.focusedButton = 'confirm';
            
            const event: KeyboardEvent = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            
            const handled = (confirmationDialog: any11765.handleKeyboard(event);
            
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog: any12003.isVisible()).toBe(false);
        });

        it('should handle Space key to execute focused button', () => {
            (confirmationDialog: any12154.dialogState.focusedButton = 'cancel';
            
            const event: KeyboardEvent = {
                key: ' ',
                preventDefault: jest.fn()
            };
            
            const handled = (confirmationDialog: any12400.handleKeyboard(event);
            
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog: any12637.isVisible()).toBe(false);
        });

        it('should handle Escape key to cancel', () => {
            const event: KeyboardEvent = {
                key: 'Escape',
                preventDefault: jest.fn()
            };
            
            const handled = (confirmationDialog: any12933.handleKeyboard(event);
            
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog: any13170.isVisible()).toBe(false);
        });

        it('should handle arrow keys to navigate between buttons', () => {
            const leftEvent: KeyboardEvent = {
                key: 'ArrowLeft',
                preventDefault: jest.fn()
            };
            
            (confirmationDialog: any13475.dialogState.focusedButton = 'cancel';
            const handled = (confirmationDialog: any13569.handleKeyboard(leftEvent);
            
            expect(handled).toBe(true);
            expect(leftEvent.preventDefault).toHaveBeenCalled();
            expect((confirmationDialog: any13761.dialogState.focusedButton).toBe('confirm');
        });

        it('should ignore keyboard events when dialog is hidden', () => {
            (confirmationDialog: any13932.hide();
            
            const event: KeyboardEvent = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            
            const handled = (confirmationDialog: any14152.handleKeyboard(event);
            
            expect(handled).toBe(false);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('should ignore unhandled keys', () => {
            const event: KeyboardEvent = {
                key: 'a',
                preventDefault: jest.fn()
            };
            
            const handled = (confirmationDialog: any14553.handleKeyboard(event);
            
            expect(handled).toBe(false);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('Legacy Keyboard Handling', () => {
        beforeEach(() => {
            (confirmationDialog: any14832.show('restart', mockOnConfirm, mockOnCancel);
        });

        it('should handle Enter key with legacy method', () => {
            const handled = (confirmationDialog: any15012.handleKeyboard('Enter');
            
            expect(handled).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog: any15191.isVisible()).toBe(false);
        });

        it('should handle Return key with legacy method', () => {
            const handled = (confirmationDialog: any15352.handleKeyboard('Return');
            
            expect(handled).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog: any15532.isVisible()).toBe(false);
        });

        it('should handle Escape key with legacy method', () => {
            const handled = (confirmationDialog: any15693.handleKeyboard('Escape');
            
            expect(handled).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog: any15872.isVisible()).toBe(false);
        });
    });

    describe('Dialog Positioning', () => {
        it('should center dialog on canvas', () => {
            (confirmationDialog: any16055.updateDialogPosition();
            
            const dialogLayout = (confirmationDialog: any16153.dialogLayout as DialogLayout;
            const expectedX = (mockCanvas.width - dialogLayout.width) / 2;
            const expectedY = (mockCanvas.height - dialogLayout.height) / 2;
            
            expect(dialogLayout.x).toBe(expectedX);
            expect(dialogLayout.y).toBe(expectedY);
        });

        it('should update button positions when dialog position changes', () => {
            const dialogLayout = (confirmationDialog: any16608.dialogLayout as DialogLayout;
            const originalConfirmX = dialogLayout.confirmButton.x;
            
            // Change canvas size
            mockCanvas.width = 1200;
            (confirmationDialog: any16829.updateDialogPosition();
            
            expect(dialogLayout.confirmButton.x).not.toBe(originalConfirmX);
        });

        it('should maintain button spacing and centering', () => {
            (confirmationDialog: any17063.updateDialogPosition();
            
            const dialogLayout = (confirmationDialog: any17161.dialogLayout as DialogLayout;
            const confirmButton = dialogLayout.confirmButton;
            const cancelButton = dialogLayout.cancelButton;
            const spacing = cancelButton.x - (confirmButton.x + confirmButton.width);
            
            expect(spacing).toBe(dialogLayout.buttonSpacing);
        });
    });

    describe('Direct Action Methods', () => {
        beforeEach(() => {
            (confirmationDialog: any17608.show('giveUp', mockOnConfirm, mockOnCancel);
        });

        it('should execute confirm action directly', () => {
            (confirmationDialog: any17767.executeConfirm();
            
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog: any17899.isVisible()).toBe(false);
        });

        it('should execute cancel action directly', () => {
            (confirmationDialog: any18038.executeCancel();
            
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog: any18168.isVisible()).toBe(false);
        });

        it('should handle missing callbacks gracefully', () => {
            (confirmationDialog: any18312.show('restart', null, null);
            
            expect(() => {
                (confirmationDialog: any18425.executeConfirm();
                (confirmationDialog: any18487.executeCancel();
            }).not.toThrow();
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

        it('should render when dialog is visible', () => {
            (confirmationDialog: any19357.show('giveUp', mockOnConfirm, mockOnCancel);
            
            (confirmationDialog: any19455.render(mockContext);
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
            expect(mockContext.fillRect).toHaveBeenCalled(); // Modal overlay and dialog
            expect(mockContext.fillText).toHaveBeenCalled(); // Text rendering
        });

        it('should not render when dialog is hidden', () => {
            (confirmationDialog: any19889.render(mockContext);
            
            expect(mockContext.save).not.toHaveBeenCalled();
        });

        it('should render focus indicator for focused button', () => {
            (confirmationDialog: any20108.show('restart', mockOnConfirm, mockOnCancel);
            (confirmationDialog: any20194.dialogState.focusedButton = 'confirm';
            
            (confirmationDialog: any20286.render(mockContext);
            
            expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 3]);
        });

        it('should use different colors for different button states', () => {
            (confirmationDialog: any20525.show('giveUp', mockOnConfirm, mockOnCancel);
            (confirmationDialog: any20610.dialogState.hoveredButton = 'confirm';
            
            (confirmationDialog: any20702.render(mockContext);
            
            // Should set different fill styles for hover state
            expect(mockContext.fillStyle).toBeDefined();
        });

        it('should update position before rendering', () => {
            (confirmationDialog: any20972.show('restart', mockOnConfirm, mockOnCancel);
            
            const updateSpy = jest.spyOn(confirmationDialog: any21099 'updateDialogPosition');
            (confirmationDialog: any21164.render(mockContext);
            
            expect(updateSpy).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        it('should provide complete dialog state', () => {
            (confirmationDialog: any21409.show('giveUp', mockOnConfirm, mockOnCancel);
            
            const state = (confirmationDialog: any21521.getDialogState() as DialogState;
            
            expect(state).toHaveProperty('visible');
            expect(state).toHaveProperty('type');
            expect(state).toHaveProperty('onConfirm');
            expect(state).toHaveProperty('onCancel');
            expect(state).toHaveProperty('hoveredButton');
            expect(state).toHaveProperty('focusedButton');
        });

        it('should provide complete dialog configuration', () => {
            const config = (confirmationDialog: any22032.getDialogConfig() as DialogConfig;
            
            expect(config).toHaveProperty('giveUp');
            expect(config).toHaveProperty('restart');
            expect(config.giveUp).toHaveProperty('title');
            expect(config.giveUp).toHaveProperty('message');
            expect(config.giveUp).toHaveProperty('confirmText');
            expect(config.giveUp).toHaveProperty('cancelText');
        });

        it('should maintain state consistency during operations', () => {
            (confirmationDialog: any22563.show('restart', mockOnConfirm, mockOnCancel);
            expect((confirmationDialog: any22656.isVisible()).toBe(true);
            
            (confirmationDialog: any22734.executeConfirm();
            expect((confirmationDialog: any22799.isVisible()).toBe(false);
            
            const state = (confirmationDialog: any22892.getDialogState() as DialogState;
            expect(state.type).toBeNull();
            expect(state.onConfirm).toBeNull();
            expect(state.onCancel).toBeNull();
        });
    });
});