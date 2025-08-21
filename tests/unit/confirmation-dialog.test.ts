/**
 * Unit tests for ConfirmationDialog component
 * Tests dialog display, interaction handling, keyboard navigation,
 * modal behavior, and callback execution
 */
import { describe, test, it, expect, beforeEach, jest  } from '@jest/globals';
import { ConfirmationDialog  } from '../../src/scenes/game-scene/ConfirmationDialog.js';
// モック用の型定義
interface MockCanvas {
    width: number,
    height: number;
interface MockGameEngine {
    canvas: MockCanvas;
interface MockRenderingContext {
    save: jest.Mock,
    restore: jest.Mock;
    fillRect: jest.Mock,
    strokeRect: jest.Mock;
    fillText: jest.Mock,
    setLineDash: jest.Mock;
    fillStyle: string,
    strokeStyle: string;
    lineWidth: number,
    font: string;
    textAlign: string,
    textBaseline: string;
    shadowColor: string,
    shadowOffsetX: number;
    shadowOffsetY: number,
    shadowBlur: number;
interface DialogLayout {
    width: number,
    height: number;
    buttonWidth: number,
    buttonHeight: number;
    buttonSpacing: number;
    x?: number;
    y?: number;
    confirmButton: {
        ,x: number },
        y: number;
        width: number,
        height: number,,
    cancelButton: {
        x: number },
        y: number;
        width: number,
        height: number;
}
interface DialogState {
    visible: boolean,
    type: string | null;
    onConfirm: (() => void) | null,
    onCancel: (() => void') | null;'
    hoveredButton: string | null,
    focusedButton: string;
interface DialogConfig {
    giveUp: {
        titl,e: string },
        message: string;
        confirmText: string,
        cancelText: string,,
    restart: {
        title: string },
        message: string;
        confirmText: string,
        cancelText: string;
}
interface KeyboardEvent {
    key: string;
    shiftKey?: boolean;
    preventDefault: jest.Mock }
describe('ConfirmationDialog', () => {
    let gameEngine: MockGameEngine,
    let confirmationDialog: ConfirmationDialog,
    let mockCanvas: MockCanvas,
    let mockOnConfirm: jest.Mock,
    let mockOnCancel: jest.Mock,
    beforeEach(() => {
        // Canvas mock setup
        mockCanvas = {
            width: 800,
            height: 600
        };
        // GameEngine mock setup
        gameEngine = {
            canvas: mockCanvas,
        // Callback mocks
        mockOnConfirm = jest.fn();
        mockOnCancel = jest.fn();
        confirmationDialog = new ConfirmationDialog(gameEngine: any),
    }');'
    describe('Initialization', (') => {'
        it('should initialize with correct default configuration', () => {
            const config = (confirmationDialog.getDialogConfig() as DialogConfig),
            expect(config.giveUp).toBeDefined();
            expect(config.restart).toBeDefined();
            expect(config.giveUp.title').toBe('確認'),'
            expect(config.giveUp.message').toBe('ゲームを終了しますか？'),'
            expect(config.restart.message').toBe('ゲームを再開始しますか？') }');
        it('should initialize with dialog hidden', () => {
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should initialize with correct layout dimensions', () => {
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            expect(dialogLayout.width).toBe(400);
            expect(dialogLayout.height).toBe(200);
            expect(dialogLayout.buttonWidth).toBe(100);
            expect(dialogLayout.buttonHeight).toBe(40) }');'
        it('should calculate button positions correctly', () => {
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            expect(dialogLayout.confirmButton).toBeDefined();
            expect(dialogLayout.cancelButton).toBeDefined();
            expect(typeof dialogLayout.confirmButton.x').toBe('number'),'
            expect(typeof dialogLayout.confirmButton.y').toBe('number') }');
    }
    describe('Dialog Display', (') => {'
        it('should show dialog with correct type and callbacks', (') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel);
            expect((confirmationDialog.isVisible().toBe(true);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.type').toBe('giveUp'),'
            expect(state.onConfirm).toBe(mockOnConfirm);
            expect(state.onCancel).toBe(mockOnCancel) }');'
        it('should reject invalid dialog types', (') => {'
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation('),'
            (confirmationDialog.show('invalid', mockOnConfirm, mockOnCancel);
            expect((confirmationDialog.isVisible().toBe(false);
            expect(consoleSpy').toHaveBeenCalledWith('Unknown dialog type: invalid','
            consoleSpy.mockRestore() }');'
        it('should hide dialog and clear state', (') => {'
            (confirmationDialog.show('restart', mockOnConfirm, mockOnCancel);
            (confirmationDialog.hide();
            expect((confirmationDialog.isVisible().toBe(false);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.type).toBeNull();
            expect(state.onConfirm).toBeNull();
            expect(state.onCancel).toBeNull() }');'
        it('should reset focus to cancel button when shown', (') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.focusedButton').toBe('cancel') }');
    }
    describe('Click Handling', () => {
        beforeEach((') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel);
            // Mock button positions for predictable testing
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            dialogLayout.confirmButton = { x: 250, y: 280, width: 100, height: 40 },
            dialogLayout.cancelButton = { x: 370, y: 280, width: 100, height: 40 },
        }');'
        it('should detect clicks on confirm button correctly', (') => {'
            const isConfirmClicked = (confirmationDialog.isButtonClicked(300, 300, 'confirm');
            expect(isConfirmClicked).toBe(true) }');'
        it('should detect clicks on cancel button correctly', (') => {'
            const isCancelClicked = (confirmationDialog.isButtonClicked(420, 300, 'cancel');
            expect(isCancelClicked).toBe(true) }');'
        it('should reject clicks outside button bounds', (') => {'
            const isConfirmClicked = (confirmationDialog.isButtonClicked(200, 300, 'confirm')'),'
            const isCancelClicked = (confirmationDialog.isButtonClicked(500, 300, 'cancel');
            expect(isConfirmClicked).toBe(false);
            expect(isCancelClicked).toBe(false) }');'
        it('should handle confirm button click and execute callback', () => {
            const handled = (confirmationDialog.handleClick(300, 300);
            expect(handled).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should handle cancel button click and execute callback', () => {
            const handled = (confirmationDialog.handleClick(420, 300);
            expect(handled).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should handle clicks inside dialog but outside buttons', () => {
            const handled = (confirmationDialog.handleClick(400, 200);
            expect(handled).toBe(true);
            expect(mockOnConfirm).not.toHaveBeenCalled();
            expect(mockOnCancel).not.toHaveBeenCalled() }');'
        it('should handle clicks outside dialog as cancel', () => {
            const handled = (confirmationDialog.handleClick(100, 100);
            expect(handled).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should ignore clicks when dialog is hidden', () => {
            (confirmationDialog.hide();
            const handled = (confirmationDialog.handleClick(300, 300);
            expect(handled).toBe(false) }');'
    }
    describe('Hover State Management', () => {
        beforeEach((') => {'
            (confirmationDialog.show('restart', mockOnConfirm, mockOnCancel);
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            dialogLayout.confirmButton = { x: 250, y: 280, width: 100, height: 40 },
            dialogLayout.cancelButton = { x: 370, y: 280, width: 100, height: 40 },
        }');'
        it('should update hover state for confirm button', () => {
            (confirmationDialog.updateMousePosition(300, 300);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.hoveredButton').toBe('confirm') }');
        it('should update hover state for cancel button', () => {
            (confirmationDialog.updateMousePosition(420, 300);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.hoveredButton').toBe('cancel') }');
        it('should clear hover state when mouse is outside buttons', () => {
            (confirmationDialog.updateMousePosition(400, 200);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.hoveredButton).toBeNull() }');'
        it('should ignore mouse position when dialog is hidden', () => {
            (confirmationDialog.hide();
            (confirmationDialog.updateMousePosition(300, 300);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.hoveredButton).toBeNull() }');'
    }
    describe('Keyboard Navigation', () => {
        beforeEach((') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel) }');'
        it('should handle Tab key to switch focus between buttons', (') => {'
            const event: KeyboardEvent = {
                key: 'Tab',
        preventDefault: jest.fn( },
            
            // Initially focused on cancel
            expect((confirmationDialog.dialogState.focusedButton').toBe('cancel');'
            const handled = (confirmationDialog.handleKeyboard(event);
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect((confirmationDialog.dialogState.focusedButton').toBe('confirm');'
        }');'
        it('should handle Enter key to execute focused button', (') => {'
            (confirmationDialog.dialogState.focusedButton = 'confirm'),
            const event: KeyboardEvent = {
                key: 'Enter',
        preventDefault: jest.fn( },
            
            const handled = (confirmationDialog.handleKeyboard(event);
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false);
        }');'
        it('should handle Space key to execute focused button', (') => {'
            (confirmationDialog.dialogState.focusedButton = 'cancel'),
            const event: KeyboardEvent = {
                key: ', ',
        preventDefault: jest.fn( },
            
            const handled = (confirmationDialog.handleKeyboard(event);
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false);
        }');'
        it('should handle Escape key to cancel', (') => {'
            const event: KeyboardEvent = {
                key: 'Escape',
        preventDefault: jest.fn( },
            
            const handled = (confirmationDialog.handleKeyboard(event);
            expect(handled).toBe(true);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false);
        }');'
        it('should handle arrow keys to navigate between buttons', (') => {'
            const leftEvent: KeyboardEvent = {
                key: 'ArrowLeft',
        preventDefault: jest.fn()' };'
            
            (confirmationDialog.dialogState.focusedButton = 'cancel');
            const handled = (confirmationDialog.handleKeyboard(leftEvent);
            expect(handled).toBe(true);
            expect(leftEvent.preventDefault).toHaveBeenCalled();
            expect((confirmationDialog.dialogState.focusedButton').toBe('confirm');'
        }');'
        it('should ignore keyboard events when dialog is hidden', () => {
            (confirmationDialog.hide()'),'
            const event: KeyboardEvent = {
                key: 'Enter',
        preventDefault: jest.fn( },
            
            const handled = (confirmationDialog.handleKeyboard(event);
            expect(handled).toBe(false);
            expect(event.preventDefault).not.toHaveBeenCalled();
        }');'
        it('should ignore unhandled keys', (') => {'
            const event: KeyboardEvent = {
                key: 'a',
        preventDefault: jest.fn( },
            
            const handled = (confirmationDialog.handleKeyboard(event);
            expect(handled).toBe(false);
            expect(event.preventDefault).not.toHaveBeenCalled();
        }');'
    }
    describe('Legacy Keyboard Handling', () => {
        beforeEach((') => {'
            (confirmationDialog.show('restart', mockOnConfirm, mockOnCancel) }');'
        it('should handle Enter key with legacy method', (') => {'
            const handled = (confirmationDialog.handleKeyboard('Enter');
            expect(handled).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should handle Return key with legacy method', (') => {'
            const handled = (confirmationDialog.handleKeyboard('Return');
            expect(handled).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should handle Escape key with legacy method', (') => {'
            const handled = (confirmationDialog.handleKeyboard('Escape');
            expect(handled).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
    }
    describe('Dialog Positioning', (') => {'
        it('should center dialog on canvas', () => {
            (confirmationDialog.updateDialogPosition();
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            const expectedX = (mockCanvas.width - dialogLayout.width) / 2,
            const expectedY = (mockCanvas.height - dialogLayout.height) / 2,
            
            expect(dialogLayout.x).toBe(expectedX);
            expect(dialogLayout.y).toBe(expectedY) }');'
        it('should update button positions when dialog position changes', () => {
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            const originalConfirmX = dialogLayout.confirmButton.x,
            
            // Change canvas size
            mockCanvas.width = 1200,
            (confirmationDialog.updateDialogPosition();
            expect(dialogLayout.confirmButton.x).not.toBe(originalConfirmX) }');'
        it('should maintain button spacing and centering', () => {
            (confirmationDialog.updateDialogPosition();
            const dialogLayout = (confirmationDialog.dialogLayout as DialogLayout),
            const confirmButton = dialogLayout.confirmButton,
            const cancelButton = dialogLayout.cancelButton,
            const spacing = cancelButton.x - (confirmButton.x + confirmButton.width),
            expect(spacing).toBe(dialogLayout.buttonSpacing) }');'
    }
    describe('Direct Action Methods', () => {
        beforeEach((') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel) }');'
        it('should execute confirm action directly', () => {
            (confirmationDialog.executeConfirm();
            expect(mockOnConfirm).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should execute cancel action directly', () => {
            (confirmationDialog.executeCancel();
            expect(mockOnCancel).toHaveBeenCalled();
            expect((confirmationDialog.isVisible().toBe(false) }');'
        it('should handle missing callbacks gracefully', (') => {'
            (confirmationDialog.show('restart', null, null);
            expect(() => {
                (confirmationDialog.executeConfirm();
                (confirmationDialog.executeCancel() }.not.toThrow();
        }
    }');'
    describe('Rendering', () => {
        let mockContext: MockRenderingContext,
        beforeEach(() => {
            mockContext = {
                save: jest.fn(
                restore: jest.fn(
                fillRect: jest.fn(
                strokeRect: jest.fn(
                fillText: jest.fn(
                setLineDash: jest.fn(','
                fillStyle: ','
                strokeStyle: ','
                lineWidth: 0,
                font: ','
                textAlign: ','
                textBaseline: ','
                shadowColor: ','
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 0
            }
        }');'
        it('should render when dialog is visible', (') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel);
            (confirmationDialog.render(mockContext);
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
            expect(mockContext.fillRect).toHaveBeenCalled(), // Modal overlay and dialog
            expect(mockContext.fillText).toHaveBeenCalled(), // Text rendering
        }');'
        it('should not render when dialog is hidden', () => {
            (confirmationDialog.render(mockContext);
            expect(mockContext.save).not.toHaveBeenCalled() }');'
        it('should render focus indicator for focused button', (') => {'
            (confirmationDialog.show('restart', mockOnConfirm, mockOnCancel)'),'
            (confirmationDialog.dialogState.focusedButton = 'confirm'),
            (confirmationDialog.render(mockContext);
            expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 3]) }');'
        it('should use different colors for different button states', (') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel)'),'
            (confirmationDialog.dialogState.hoveredButton = 'confirm'),
            (confirmationDialog.render(mockContext);
            // Should set different fill styles for hover state
            expect(mockContext.fillStyle).toBeDefined() }');'
        it('should update position before rendering', (') => {'
            (confirmationDialog.show('restart', mockOnConfirm, mockOnCancel)'),'
            const updateSpy = jest.spyOn(confirmationDialog 'updateDialogPosition');
            (confirmationDialog.render(mockContext);
            expect(updateSpy).toHaveBeenCalled() }');'
    }
    describe('State Management', (') => {'
        it('should provide complete dialog state', (') => {'
            (confirmationDialog.show('giveUp', mockOnConfirm, mockOnCancel);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state').toHaveProperty('visible'),'
            expect(state').toHaveProperty('type'),'
            expect(state').toHaveProperty('onConfirm'),'
            expect(state').toHaveProperty('onCancel'),'
            expect(state').toHaveProperty('hoveredButton'),'
            expect(state').toHaveProperty('focusedButton') }');
        it('should provide complete dialog configuration', () => {
            const config = (confirmationDialog.getDialogConfig() as DialogConfig),
            expect(config').toHaveProperty('giveUp'),'
            expect(config').toHaveProperty('restart'),'
            expect(config.giveUp').toHaveProperty('title'),'
            expect(config.giveUp').toHaveProperty('message'),'
            expect(config.giveUp').toHaveProperty('confirmText'),'
            expect(config.giveUp').toHaveProperty('cancelText') }');
        it('should maintain state consistency during operations', (') => {'
            (confirmationDialog.show('restart', mockOnConfirm, mockOnCancel);
            expect((confirmationDialog.isVisible().toBe(true);
            (confirmationDialog.executeConfirm();
            expect((confirmationDialog.isVisible().toBe(false);
            const state = (confirmationDialog.getDialogState() as DialogState),
            expect(state.type).toBeNull();
            expect(state.onConfirm).toBeNull();
            expect(state.onCancel).toBeNull() }
    }
}');'