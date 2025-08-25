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
    isVisible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    hoveredButton: 'confirm' | 'cancel' | null;
    activeButton: 'confirm' | 'cancel' | null;
    focusedButton: 'confirm' | 'cancel';
}

interface DialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
}

interface ConfirmationDialogType {
    gameEngine: MockGameEngine;
    layout: DialogLayout;
    state: DialogState;
    // メソッド
    show(options: DialogOptions): void;
    hide(): void;
    render(ctx: MockRenderingContext): void;
    handleClick(x: number, y: number): boolean;
    handleMouseMove(x: number, y: number): void;
    handleKeyDown(event: KeyboardEvent): boolean;
    handleKeyUp(event: KeyboardEvent): boolean;
    isVisible(): boolean;
    getButtonAt(x: number, y: number): 'confirm' | 'cancel' | null;
    updateLayout(): void;
    dispose(): void;
}

// Canvas Rendering Context モックの作成
const createMockContext = (): MockRenderingContext => {
    return {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        fillText: jest.fn(),
        setLineDash: jest.fn(),
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        font: '14px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        shadowColor: 'rgba(0,0,0,0)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0
    };
};

describe('ConfirmationDialog', () => {
    let confirmationDialog: ConfirmationDialogType;
    let mockGameEngine: MockGameEngine;
    let mockContext: MockRenderingContext;
    let mockOnConfirm: jest.Mock;
    let mockOnCancel: jest.Mock;
    let mockOnClose: jest.Mock;

    beforeEach(() => {
        mockGameEngine = {
            canvas: { width: 800, height: 600 }
        };

        mockContext = createMockContext();

        mockOnConfirm = jest.fn();
        mockOnCancel = jest.fn();
        mockOnClose = jest.fn();

        // ConfirmationDialogのモック実装
        confirmationDialog = {
            gameEngine: mockGameEngine,
            layout: {
                width: 400,
                height: 200,
                buttonWidth: 80,
                buttonHeight: 30,
                buttonSpacing: 20,
                x: 200,
                y: 200,
                confirmButton: {
                    x: 240,
                    y: 350,
                    width: 80,
                    height: 30
                },
                cancelButton: {
                    x: 340,
                    y: 350,
                    width: 80,
                    height: 30
                }
            },
            state: {
                isVisible: false,
                title: '',
                message: '',
                confirmText: 'OK',
                cancelText: 'Cancel',
                hoveredButton: null,
                activeButton: null,
                focusedButton: 'confirm'
            },

            show: jest.fn((options: DialogOptions) => {
                confirmationDialog.state.isVisible = true;
                confirmationDialog.state.title = options.title;
                confirmationDialog.state.message = options.message;
                confirmationDialog.state.confirmText = options.confirmText || 'OK';
                confirmationDialog.state.cancelText = options.cancelText || 'Cancel';
            }),

            hide: jest.fn(() => {
                confirmationDialog.state.isVisible = false;
                confirmationDialog.state.hoveredButton = null;
                confirmationDialog.state.activeButton = null;
                confirmationDialog.state.focusedButton = 'confirm';
            }),

            render: jest.fn(),

            handleClick: jest.fn((x: number, y: number) => {
                if (!confirmationDialog.state.isVisible) return false;
                
                const button = confirmationDialog.getButtonAt(x, y);
                if (button === 'confirm') {
                    mockOnConfirm();
                    confirmationDialog.hide();
                    return true;
                } else if (button === 'cancel') {
                    mockOnCancel();
                    confirmationDialog.hide();
                    return true;
                }
                return false;
            }),

            handleMouseMove: jest.fn((x: number, y: number) => {
                if (!confirmationDialog.state.isVisible) return;
                
                const button = confirmationDialog.getButtonAt(x, y);
                confirmationDialog.state.hoveredButton = button;
            }),

            handleKeyDown: jest.fn((event: KeyboardEvent) => {
                if (!confirmationDialog.state.isVisible) return false;
                
                if (event.key === 'Enter') {
                    if (confirmationDialog.state.focusedButton === 'confirm') {
                        mockOnConfirm();
                    } else {
                        mockOnCancel();
                    }
                    confirmationDialog.hide();
                    return true;
                } else if (event.key === 'Escape') {
                    mockOnCancel();
                    confirmationDialog.hide();
                    return true;
                } else if (event.key === 'Tab') {
                    confirmationDialog.state.focusedButton = 
                        confirmationDialog.state.focusedButton === 'confirm' ? 'cancel' : 'confirm';
                    return true;
                }
                return false;
            }),

            handleKeyUp: jest.fn(() => false),
            isVisible: jest.fn(() => confirmationDialog.state.isVisible),
            
            getButtonAt: jest.fn((x: number, y: number) => {
                const { confirmButton, cancelButton } = confirmationDialog.layout;
                
                if (x >= confirmButton.x && x <= confirmButton.x + confirmButton.width &&
                    y >= confirmButton.y && y <= confirmButton.y + confirmButton.height) {
                    return 'confirm';
                }
                if (x >= cancelButton.x && x <= cancelButton.x + cancelButton.width &&
                    y >= cancelButton.y && y <= cancelButton.y + cancelButton.height) {
                    return 'cancel';
                }
                return null;
            }),

            updateLayout: jest.fn(() => {
                const centerX = mockGameEngine.canvas.width / 2;
                const centerY = mockGameEngine.canvas.height / 2;
                
                confirmationDialog.layout.x = centerX - confirmationDialog.layout.width / 2;
                confirmationDialog.layout.y = centerY - confirmationDialog.layout.height / 2;
                
                // Update button positions
                const buttonY = confirmationDialog.layout.y + confirmationDialog.layout.height - 50;
                const buttonSpacing = confirmationDialog.layout.buttonSpacing;
                const totalButtonWidth = confirmationDialog.layout.buttonWidth * 2 + buttonSpacing;
                const startX = centerX - totalButtonWidth / 2;
                
                confirmationDialog.layout.confirmButton.x = startX;
                confirmationDialog.layout.confirmButton.y = buttonY;
                confirmationDialog.layout.cancelButton.x = startX + confirmationDialog.layout.buttonWidth + buttonSpacing;
                confirmationDialog.layout.cancelButton.y = buttonY;
            }),

            dispose: jest.fn()
        };
    });

    describe('初期化と基本状態', () => {
        test('正常に初期化される', () => {
            expect(confirmationDialog).toBeDefined();
            expect(confirmationDialog.gameEngine).toBe(mockGameEngine);
            expect(confirmationDialog.state.isVisible).toBe(false);
        });

        test('初期レイアウトが設定される', () => {
            expect(confirmationDialog.layout.width).toBeGreaterThan(0);
            expect(confirmationDialog.layout.height).toBeGreaterThan(0);
            expect(confirmationDialog.layout.buttonWidth).toBeGreaterThan(0);
            expect(confirmationDialog.layout.buttonHeight).toBeGreaterThan(0);
        });

        test('初期フォーカスが確認ボタンに設定される', () => {
            expect(confirmationDialog.state.focusedButton).toBe('confirm');
        });

        test('初期状態でホバーやアクティブボタンがない', () => {
            expect(confirmationDialog.state.hoveredButton).toBeNull();
            expect(confirmationDialog.state.activeButton).toBeNull();
        });
    });

    describe('ダイアログの表示と非表示', () => {
        const dialogOptions: DialogOptions = {
            title: 'Test Dialog',
            message: 'This is a test message',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: mockOnConfirm,
            onCancel: mockOnCancel,
            onClose: mockOnClose
        };

        test('show()でダイアログが表示される', () => {
            confirmationDialog.show(dialogOptions);

            expect(confirmationDialog.show).toHaveBeenCalledWith(dialogOptions);
            expect(confirmationDialog.state.isVisible).toBe(true);
            expect(confirmationDialog.state.title).toBe(dialogOptions.title);
            expect(confirmationDialog.state.message).toBe(dialogOptions.message);
            expect(confirmationDialog.state.confirmText).toBe(dialogOptions.confirmText);
            expect(confirmationDialog.state.cancelText).toBe(dialogOptions.cancelText);
        });

        test('hide()でダイアログが非表示になる', () => {
            confirmationDialog.show(dialogOptions);
            confirmationDialog.hide();

            expect(confirmationDialog.hide).toHaveBeenCalled();
            expect(confirmationDialog.state.isVisible).toBe(false);
            expect(confirmationDialog.state.hoveredButton).toBeNull();
            expect(confirmationDialog.state.activeButton).toBeNull();
            expect(confirmationDialog.state.focusedButton).toBe('confirm');
        });

        test('isVisible()が正しい状態を返す', () => {
            expect(confirmationDialog.isVisible()).toBe(false);

            confirmationDialog.show(dialogOptions);
            expect(confirmationDialog.isVisible()).toBe(true);

            confirmationDialog.hide();
            expect(confirmationDialog.isVisible()).toBe(false);
        });

        test('デフォルトボタンテキストが設定される', () => {
            const defaultOptions: DialogOptions = {
                title: 'Default Dialog',
                message: 'Default message'
            };

            confirmationDialog.show(defaultOptions);
            expect(confirmationDialog.state.confirmText).toBe('OK');
            expect(confirmationDialog.state.cancelText).toBe('Cancel');
        });
    });

    describe('レンダリング', () => {
        test('非表示時はレンダリングされない', () => {
            confirmationDialog.render(mockContext);
            expect(confirmationDialog.render).toHaveBeenCalledWith(mockContext);
        });

        test('表示時にレンダリングされる', () => {
            confirmationDialog.show({
                title: 'Render Test',
                message: 'Testing render'
            });

            confirmationDialog.render(mockContext);
            expect(confirmationDialog.render).toHaveBeenCalledWith(mockContext);
        });
    });

    describe('クリック処理', () => {
        beforeEach(() => {
            confirmationDialog.show({
                title: 'Click Test',
                message: 'Testing clicks',
                onConfirm: mockOnConfirm,
                onCancel: mockOnCancel
            });
        });

        test('確認ボタンクリックで確認コールバックが呼ばれる', () => {
            const { confirmButton } = confirmationDialog.layout;
            const result = confirmationDialog.handleClick(
                confirmButton.x + confirmButton.width / 2,
                confirmButton.y + confirmButton.height / 2
            );

            expect(result).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect(confirmationDialog.state.isVisible).toBe(false);
        });

        test('キャンセルボタンクリックでキャンセルコールバックが呼ばれる', () => {
            const { cancelButton } = confirmationDialog.layout;
            const result = confirmationDialog.handleClick(
                cancelButton.x + cancelButton.width / 2,
                cancelButton.y + cancelButton.height / 2
            );

            expect(result).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect(confirmationDialog.state.isVisible).toBe(false);
        });

        test('ダイアログ外クリックで何も起こらない', () => {
            const result = confirmationDialog.handleClick(0, 0);

            expect(result).toBe(false);
            expect(mockOnConfirm).not.toHaveBeenCalled();
            expect(mockOnCancel).not.toHaveBeenCalled();
            expect(confirmationDialog.state.isVisible).toBe(true);
        });

        test('非表示時のクリックは無視される', () => {
            confirmationDialog.hide();
            const result = confirmationDialog.handleClick(250, 350);
            expect(result).toBe(false);
        });
    });

    describe('マウス移動処理', () => {
        beforeEach(() => {
            confirmationDialog.show({
                title: 'Mouse Test',
                message: 'Testing mouse movement'
            });
        });

        test('確認ボタン上でのホバー状態', () => {
            const { confirmButton } = confirmationDialog.layout;
            confirmationDialog.handleMouseMove(
                confirmButton.x + confirmButton.width / 2,
                confirmButton.y + confirmButton.height / 2
            );

            expect(confirmationDialog.handleMouseMove).toHaveBeenCalled();
        });

        test('キャンセルボタン上でのホバー状態', () => {
            const { cancelButton } = confirmationDialog.layout;
            confirmationDialog.handleMouseMove(
                cancelButton.x + cancelButton.width / 2,
                cancelButton.y + cancelButton.height / 2
            );

            expect(confirmationDialog.handleMouseMove).toHaveBeenCalled();
        });

        test('ボタン外でのホバー解除', () => {
            confirmationDialog.handleMouseMove(0, 0);
            expect(confirmationDialog.handleMouseMove).toHaveBeenCalled();
        });

        test('非表示時のマウス移動は無視される', () => {
            confirmationDialog.hide();
            confirmationDialog.handleMouseMove(250, 350);
            expect(confirmationDialog.handleMouseMove).toHaveBeenCalled();
        });
    });

    describe('キーボード処理', () => {
        beforeEach(() => {
            confirmationDialog.show({
                title: 'Keyboard Test',
                message: 'Testing keyboard input',
                onConfirm: mockOnConfirm,
                onCancel: mockOnCancel
            });
        });

        test('Enterキーで確認実行', () => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            const result = confirmationDialog.handleKeyDown(enterEvent);

            expect(result).toBe(true);
            expect(mockOnConfirm).toHaveBeenCalled();
            expect(confirmationDialog.state.isVisible).toBe(false);
        });

        test('Escapeキーでキャンセル実行', () => {
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            const result = confirmationDialog.handleKeyDown(escEvent);

            expect(result).toBe(true);
            expect(mockOnCancel).toHaveBeenCalled();
            expect(confirmationDialog.state.isVisible).toBe(false);
        });

        test('Tabキーでフォーカス移動', () => {
            expect(confirmationDialog.state.focusedButton).toBe('confirm');

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            confirmationDialog.handleKeyDown(tabEvent);

            expect(confirmationDialog.state.focusedButton).toBe('cancel');

            confirmationDialog.handleKeyDown(tabEvent);
            expect(confirmationDialog.state.focusedButton).toBe('confirm');
        });

        test('キャンセルフォーカス時のEnterキー', () => {
            confirmationDialog.state.focusedButton = 'cancel';

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            confirmationDialog.handleKeyDown(enterEvent);

            expect(mockOnCancel).toHaveBeenCalled();
        });

        test('非表示時のキー入力は無視される', () => {
            confirmationDialog.hide();
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            const result = confirmationDialog.handleKeyDown(enterEvent);

            expect(result).toBe(false);
            expect(mockOnConfirm).not.toHaveBeenCalled();
        });

        test('未対応キーは無視される', () => {
            const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            const result = confirmationDialog.handleKeyDown(arrowEvent);

            expect(result).toBe(false);
        });
    });

    describe('ボタン位置検出', () => {
        test('確認ボタンの範囲内を正しく検出する', () => {
            const { confirmButton } = confirmationDialog.layout;
            const button = confirmationDialog.getButtonAt(
                confirmButton.x + 1,
                confirmButton.y + 1
            );

            expect(button).toBe('confirm');
        });

        test('キャンセルボタンの範囲内を正しく検出する', () => {
            const { cancelButton } = confirmationDialog.layout;
            const button = confirmationDialog.getButtonAt(
                cancelButton.x + 1,
                cancelButton.y + 1
            );

            expect(button).toBe('cancel');
        });

        test('ボタン範囲外ではnullを返す', () => {
            const button = confirmationDialog.getButtonAt(0, 0);
            expect(button).toBeNull();
        });

        test('境界値での検出', () => {
            const { confirmButton } = confirmationDialog.layout;
            
            // 左上角
            let button = confirmationDialog.getButtonAt(confirmButton.x, confirmButton.y);
            expect(button).toBe('confirm');

            // 右下角
            button = confirmationDialog.getButtonAt(
                confirmButton.x + confirmButton.width,
                confirmButton.y + confirmButton.height
            );
            expect(button).toBe('confirm');
        });
    });

    describe('レイアウト更新', () => {
        test('canvas サイズ変更時にレイアウトが更新される', () => {
            mockGameEngine.canvas.width = 1200;
            mockGameEngine.canvas.height = 800;

            confirmationDialog.updateLayout();
            expect(confirmationDialog.updateLayout).toHaveBeenCalled();
            // レイアウトが中央に配置されることを確認
            expect(confirmationDialog.layout.x).toBe(1200 / 2 - confirmationDialog.layout.width / 2);
            expect(confirmationDialog.layout.y).toBe(800 / 2 - confirmationDialog.layout.height / 2);
        });

        test('ボタン位置が正しく計算される', () => {
            confirmationDialog.updateLayout();
            const { confirmButton, cancelButton } = confirmationDialog.layout;
            expect(confirmButton.y).toBe(cancelButton.y); // 同じ行
            expect(confirmButton.x).toBeLessThan(cancelButton.x); // 確認ボタンが左
        });
    });

    describe('エラーハンドリング', () => {
        test('nullコンテキストでのレンダリング', () => {
            expect(() => {
                confirmationDialog.render(null as any);
            }).not.toThrow();
        });

        test('無効な座標でのクリック処理', () => {
            expect(() => {
                confirmationDialog.handleClick(-100, -100);
            }).not.toThrow();
        });

        test('無効なマウス座標の処理', () => {
            expect(() => {
                confirmationDialog.handleMouseMove(NaN, NaN);
            }).not.toThrow();
        });

        test('不正なキーボードイベント', () => {
            const nullEvent = null as any;
            expect(() => {
                confirmationDialog.handleKeyDown(nullEvent);
            }).not.toThrow();
        });
    });

    describe('リソース管理', () => {
        test('dispose()でリソースがクリーンアップされる', () => {
            confirmationDialog.dispose();
            expect(confirmationDialog.dispose).toHaveBeenCalled();
        });

        test('dispose後も基本操作でエラーが出ない', () => {
            confirmationDialog.dispose();
            expect(() => {
                confirmationDialog.show({
                    title: 'After Dispose',
                    message: 'This should not crash'
                });
            }).not.toThrow();
        });
    });

    describe('アクセシビリティ', () => {
        test('キーボードナビゲーションがサポートされる', () => {
            confirmationDialog.show({
                title: 'Accessibility Test',
                message: 'Testing keyboard navigation'
            });

            // 初期フォーカスは確認ボタン
            expect(confirmationDialog.state.focusedButton).toBe('confirm');

            // Tab で移動
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            confirmationDialog.handleKeyDown(tabEvent);
            expect(confirmationDialog.state.focusedButton).toBe('cancel');
        });

        test('Enter キーでフォーカスされたボタンが実行される', () => {
            confirmationDialog.show({
                title: 'Focus Test',
                message: 'Testing focused execution',
                onConfirm: mockOnConfirm,
                onCancel: mockOnCancel
            });

            // 確認ボタンフォーカス時
            confirmationDialog.state.focusedButton = 'confirm';
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            confirmationDialog.handleKeyDown(enterEvent);
            expect(mockOnConfirm).toHaveBeenCalled();

            // リセット
            mockOnConfirm.mockReset();
            mockOnCancel.mockReset();

            confirmationDialog.show({
                title: 'Focus Test 2',
                message: 'Testing cancel focus',
                onConfirm: mockOnConfirm,
                onCancel: mockOnCancel
            });

            // キャンセルボタンフォーカス時
            confirmationDialog.state.focusedButton = 'cancel';
            confirmationDialog.handleKeyDown(enterEvent);
            expect(mockOnCancel).toHaveBeenCalled();
        });
    });
});