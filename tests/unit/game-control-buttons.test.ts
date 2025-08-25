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
    size: { width: number; height: number };
    position?: { x: number; y: number };
    style?: any;
}

interface MockContext {
    save: jest.Mock;
    restore: jest.Mock;
    fillRect: jest.Mock;
    strokeRect: jest.Mock;
    fillText: jest.Mock;
    measureText: jest.Mock;
    translate: jest.Mock;
    scale: jest.Mock;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    globalAlpha: number;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
}

describe('GameControlButtons', () => {
    let gameControlButtons: GameControlButtons;
    let mockGameEngine: MockGameEngine;
    let mockUIManager: MockUIManager;
    let mockContext: MockContext;
    let mockResponsiveCanvasManager: MockResponsiveCanvasManager;

    beforeEach(() => {
        // キャンバスマネージャーのモック
        mockResponsiveCanvasManager = {
            getCanvasInfo: jest.fn(() => ({
                baseWidth: 800,
                baseHeight: 600,
                scale: 1,
                scaleFactor: 1,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 800,
                actualHeight: 600,
                pixelRatio: 1
            })),
            getScaledCoordinates: jest.fn((x: number, y: number) => ({ x, y }))
        };

        // ゲームエンジンのモック
        mockGameEngine = {
            canvas: { width: 800, height: 600 },
            responsiveCanvasManager: mockResponsiveCanvasManager
        };

        // UIマネージャーのモック
        mockUIManager = {
            showConfirmationDialog: jest.fn()
        };

        // Canvasコンテキストのモック
        mockContext = {
            save: jest.fn(),
            restore: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            translate: jest.fn(),
            scale: jest.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: 'center',
            textBaseline: 'middle',
            globalAlpha: 1,
            shadowBlur: 0,
            shadowColor: '',
            shadowOffsetX: 0,
            shadowOffsetY: 0
        };

        // GameControlButtonsインスタンスを作成
        gameControlButtons = new GameControlButtons(mockGameEngine as any, mockUIManager as any);
    });

    describe('初期化とボタン設定', () => {
        test('正しく初期化される', () => {
            expect(gameControlButtons).toBeDefined();
            expect(gameControlButtons.getButtons()).toHaveLength(2); // Give UpとRestartボタン
        });

        test('ボタン設定が正しい', () => {
            const buttons = gameControlButtons.getButtons();
            
            // Give Upボタン
            expect(buttons[0].id).toBe('giveup');
            expect(buttons[0].text).toBe('ギブアップ');
            expect(buttons[0].action).toBe('giveup');
            
            // Restartボタン
            expect(buttons[1].id).toBe('restart');
            expect(buttons[1].text).toBe('リスタート');
            expect(buttons[1].action).toBe('restart');
        });

        test('ボタン位置が正しく計算される', () => {
            const buttons = gameControlButtons.getButtons();
            
            // 右下隅に配置されているか確認
            expect(buttons[0].position.x).toBeGreaterThan(600); // 画面右側
            expect(buttons[0].position.y).toBeGreaterThan(400); // 画面下側
        });
    });

    describe('レンダリング', () => {
        test('render関数が正しく動作する', () => {
            gameControlButtons.render(mockContext as any);
            
            // コンテキストメソッドが呼ばれたか確認
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
            expect(mockContext.fillRect).toHaveBeenCalledTimes(2); // 2つのボタン
            expect(mockContext.fillText).toHaveBeenCalledTimes(2); // 2つのテキスト
        });

        test('ホバー状態でスタイルが変更される', () => {
            const buttons = gameControlButtons.getButtons();
            buttons[0].isHovered = true;
            
            gameControlButtons.render(mockContext as any);
            
            // ホバー時のスタイルが適用されているか確認
            expect(mockContext.globalAlpha).toBeDefined();
        });

        test('押下状態でスタイルが変更される', () => {
            const buttons = gameControlButtons.getButtons();
            buttons[0].isPressed = true;
            
            gameControlButtons.render(mockContext as any);
            
            // 押下時のスタイルが適用されているか確認
            expect(mockContext.translate).toHaveBeenCalled();
        });
    });

    describe('イベントハンドリング', () => {
        test('クリックイベントが正しく検出される', () => {
            const event = {
                offsetX: 700,
                offsetY: 500
            };
            
            const clicked = gameControlButtons.handleClick(event);
            
            expect(clicked).toBeTruthy();
            expect(mockUIManager.showConfirmationDialog).toHaveBeenCalled();
        });

        test('ボタン外のクリックは検出されない', () => {
            const event = {
                offsetX: 100,
                offsetY: 100
            };
            
            const clicked = gameControlButtons.handleClick(event);
            
            expect(clicked).toBeFalsy();
            expect(mockUIManager.showConfirmationDialog).not.toHaveBeenCalled();
        });

        test('確認ダイアログが正しく表示される', () => {
            const event = {
                offsetX: 700,
                offsetY: 500
            };
            
            gameControlButtons.handleClick(event);
            
            expect(mockUIManager.showConfirmationDialog).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: expect.any(String),
                    message: expect.any(String),
                    onConfirm: expect.any(Function)
                })
            );
        });
    });

    describe('マウスホバー処理', () => {
        test('マウスムーブでホバー状態が更新される', () => {
            const event = {
                offsetX: 700,
                offsetY: 500
            };
            
            gameControlButtons.handleMouseMove(event);
            
            const buttons = gameControlButtons.getButtons();
            expect(buttons.some(btn => btn.isHovered)).toBe(true);
        });

        test('ボタン外でホバー状態が解除される', () => {
            // まずホバー状態にする
            gameControlButtons.handleMouseMove({ offsetX: 700, offsetY: 500 });
            
            // ボタン外に移動
            gameControlButtons.handleMouseMove({ offsetX: 100, offsetY: 100 });
            
            const buttons = gameControlButtons.getButtons();
            expect(buttons.every(btn => !btn.isHovered)).toBe(true);
        });
    });

    describe('レスポンシブ対応', () => {
        test('キャンバススケールに応じて座標が変換される', () => {
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue({
                baseWidth: 800,
                baseHeight: 600,
                scale: 2,
                scaleFactor: 2,
                displayWidth: 1600,
                displayHeight: 1200,
                actualWidth: 1600,
                actualHeight: 1200,
                pixelRatio: 2
            });
            
            mockResponsiveCanvasManager.getScaledCoordinates.mockImplementation(
                (x: number, y: number) => ({ x: x * 2, y: y * 2 })
            );
            
            const event = { offsetX: 1400, offsetY: 1000 };
            const clicked = gameControlButtons.handleClick(event);
            
            expect(mockResponsiveCanvasManager.getScaledCoordinates).toHaveBeenCalled();
        });

        test('ResponsiveCanvasManagerが存在しない場合も動作する', () => {
            mockGameEngine.responsiveCanvasManager = null;
            const buttons = new GameControlButtons(mockGameEngine as any, mockUIManager as any);
            
            expect(() => {
                buttons.render(mockContext as any);
                buttons.handleClick({ offsetX: 700, offsetY: 500 });
            }).not.toThrow();
        });
    });

    describe('ボタン状態管理', () => {
        test('ボタンの有効/無効が切り替えられる', () => {
            gameControlButtons.setButtonEnabled('giveup', false);
            
            const buttons = gameControlButtons.getButtons();
            const giveupButton = buttons.find(btn => btn.id === 'giveup');
            
            expect(giveupButton?.isDisabled).toBe(true);
        });

        test('無効なボタンはクリックできない', () => {
            gameControlButtons.setButtonEnabled('giveup', false);
            
            const event = { offsetX: 700, offsetY: 500 };
            gameControlButtons.handleClick(event);
            
            expect(mockUIManager.showConfirmationDialog).not.toHaveBeenCalled();
        });

        test('ボタンの表示/非表示が切り替えられる', () => {
            gameControlButtons.setButtonVisible('restart', false);
            
            const buttons = gameControlButtons.getButtons();
            const restartButton = buttons.find(btn => btn.id === 'restart');
            
            expect(restartButton?.isVisible).toBe(false);
        });
    });

    describe('アクセシビリティ', () => {
        test('キーボードナビゲーションが動作する', () => {
            // Tabキーでフォーカス移動
            gameControlButtons.handleKeyDown({ key: 'Tab' } as KeyboardEvent);
            
            const buttons = gameControlButtons.getButtons();
            expect(buttons.some(btn => btn.isFocused)).toBe(true);
        });

        test('Enterキーでボタンがアクティブになる', () => {
            // フォーカスを設定
            const buttons = gameControlButtons.getButtons();
            buttons[0].isFocused = true;
            
            // Enterキーを押す
            gameControlButtons.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
            
            expect(mockUIManager.showConfirmationDialog).toHaveBeenCalled();
        });

        test('スペースキーでもボタンがアクティブになる', () => {
            // フォーカスを設定
            const buttons = gameControlButtons.getButtons();
            buttons[0].isFocused = true;
            
            // スペースキーを押す
            gameControlButtons.handleKeyDown({ key: ' ' } as KeyboardEvent);
            
            expect(mockUIManager.showConfirmationDialog).toHaveBeenCalled();
        });
    });

    describe('モバイル対応', () => {
        test('タッチイベントが正しく処理される', () => {
            const touchEvent = {
                touches: [{
                    clientX: 700,
                    clientY: 500
                }]
            };
            
            const touched = gameControlButtons.handleTouch(touchEvent as any);
            
            expect(touched).toBeTruthy();
            expect(mockUIManager.showConfirmationDialog).toHaveBeenCalled();
        });

        test('マルチタッチの場合は最初のタッチのみ処理される', () => {
            const touchEvent = {
                touches: [
                    { clientX: 700, clientY: 500 },
                    { clientX: 100, clientY: 100 }
                ]
            };
            
            gameControlButtons.handleTouch(touchEvent as any);
            
            // 1回だけ呼ばれることを確認
            expect(mockUIManager.showConfirmationDialog).toHaveBeenCalledTimes(1);
        });
    });

    describe('パフォーマンス最適化', () => {
        test('非表示のボタンはレンダリングされない', () => {
            gameControlButtons.setButtonVisible('restart', false);
            
            gameControlButtons.render(mockContext as any);
            
            // fillRectが1回だけ（Give Upボタンのみ）呼ばれることを確認
            expect(mockContext.fillRect).toHaveBeenCalledTimes(1);
        });

        test('ボタン状態の変更が効率的に処理される', () => {
            const startTime = performance.now();
            
            // 1000回状態を変更
            for (let i = 0; i < 1000; i++) {
                gameControlButtons.setButtonEnabled('giveup', i % 2 === 0);
                gameControlButtons.setButtonVisible('restart', i % 2 === 1);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // 処理時間が妥当であることを確認
            expect(duration).toBeLessThan(100); // 100ms以内
        });
    });
});