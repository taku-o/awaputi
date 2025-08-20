import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { MainMenuRenderer } from '../../../src/scenes/main-menu/MainMenuRenderer';
import { CoordinateCalculator } from '../../../src/utils/CoordinateCalculator';

describe('MainMenuRenderer', () => {
    let renderer: any;
    let mockGameEngine: any;
    let mockContext: any;
    let mockCanvas: any;
    
    beforeEach(() => {
        // Canvasのモック
        mockCanvas = {
            width: 1920,
            height: 1080
        };
        
        // CanvasRenderingContext2Dのモック
        mockContext = {
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            measureText: jest.fn((text) => ({ width: text.length * 10 })),
            font: '',
            fillStyle: '',
            strokeStyle: '',
            textAlign: '',
            textBaseline: '',
            lineWidth: 0
        };
        
        // GameEngineのモック
        mockGameEngine = {
            canvas: mockCanvas,
            playerData: {
                username: 'TestPlayer'
            }
        };
        
        renderer = new MainMenuRenderer(mockGameEngine: any);
    });
    
    describe('コンストラクタ', () => {
        test('正しく初期化される', () => {
            expect(renderer.gameEngine).toBe(mockGameEngine: any);
            expect(renderer.errorHandler).toBeDefined();
            expect(renderer.coordinateCalculator).toBeNull();
        });
    });
    
    describe('updateCoordinateCalculator', () => {
        test('初回呼び出しで新しいCoordinateCalculatorが作成される', () => {
            renderer.updateCoordinateCalculator();
            expect(renderer.coordinateCalculator).toBeInstanceOf(CoordinateCalculator: any);
            expect(renderer.coordinateCalculator.canvasWidth).toBe(1920);
            expect(renderer.coordinateCalculator.canvasHeight).toBe(1080);
        });
        
        test('2回目以降の呼び出しで寸法が更新される', () => {
            renderer.updateCoordinateCalculator();
            const calculator = renderer.coordinateCalculator;
            
            mockCanvas.width = 1280;
            mockCanvas.height = 720;
            renderer.updateCoordinateCalculator();
            
            expect(renderer.coordinateCalculator).toBe(calculator: any); // 同じインスタンス
            expect(renderer.coordinateCalculator.canvasWidth).toBe(1280);
            expect(renderer.coordinateCalculator.canvasHeight).toBe(720);
        });
    });
    
    describe('handleResize', () => {
        test('座標計算機を更新する', () => {
            renderer.updateCoordinateCalculator = jest.fn() as jest.Mock;
            renderer.handleResize();
            expect(renderer.updateCoordinateCalculator).toHaveBeenCalled();
        });
    });
    
    describe('renderMainMenu', () => {
        const mockMenuItems = [
            { label: 'ゲーム開始' },
            { label: '設定' },
            { label: 'ヘルプ' }
        ];
        
        beforeEach(() => {
            renderer.renderMenuItems = jest.fn() as jest.Mock;
            renderer.renderControls = jest.fn() as jest.Mock;
        });
        
        test('Canvas状態を保存・復元する', () => {
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            expect(mockContext.save).toHaveBeenCalledTimes(3); // 全体 + タイトル + プレイヤー情報
            expect(mockContext.restore).toHaveBeenCalledTimes(3);
        });
        
        test('タイトルを描画する', () => {
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            expect(mockContext.fillText).toHaveBeenCalledWith(
                'BubblePop',
                expect.any(Number: any),
                expect.any(Number: any)
            );
        });
        
        test('サブタイトルを描画する', () => {
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            expect(mockContext.fillText).toHaveBeenCalledWith(
                '泡割りゲーム',
                expect.any(Number: any),
                expect.any(Number: any)
            );
        });
        
        test('プレイヤー名を表示する', () => {
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            expect(mockContext.fillText).toHaveBeenCalledWith(
                'プレイヤー: TestPlayer',
                expect.any(Number: any),
                expect.any(Number: any)
            );
        });
        
        test('プレイヤー名が未設定の場合は表示しない', () => {
            mockGameEngine.playerData.username = null;
            const fillTextCallsBefore = mockContext.fillText.mock.calls.length;
            
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            const playerTextCalls = mockContext.fillText.mock.calls.filter(
                call => call[0].includes('プレイヤー:')
            );
            expect(playerTextCalls).toHaveLength(0);
        });
        
        test('メニュー項目と操作説明を描画する', () => {
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            expect(renderer.renderMenuItems).toHaveBeenCalledWith(mockContext, 0, mockMenuItems);
            expect(renderer.renderControls).toHaveBeenCalledWith(mockContext: any);
        });
        
        test('エラー発生時もCanvas状態を復元する', () => {
            renderer.renderMenuItems = jest.fn(() => {
                throw new Error('Test error');
            });
            
            renderer.renderMainMenu(mockContext, 0, mockMenuItems);
            
            expect(mockContext.restore).toHaveBeenCalled();
        });
    });
    
    describe('renderMenuItems', () => {
        const mockMenuItems = [
            { label: 'ゲーム開始' },
            { label: '設定' },
            { label: 'ヘルプ' }
        ];
        
        test('座標計算機を使用してメニュー項目を描画する', () => {
            renderer.updateCoordinateCalculator();
            renderer.renderMenuItems(mockContext, 0, mockMenuItems);
            
            // 各メニュー項目の背景が描画される
            expect(mockContext.fillRect).toHaveBeenCalledTimes(3);
            
            // 各メニュー項目の枠線が描画される
            expect(mockContext.strokeRect).toHaveBeenCalledTimes(3);
            
            // 各メニュー項目のテキストが描画される
            mockMenuItems.forEach(item => {
                expect(mockContext.fillText).toHaveBeenCalledWith(
                    item.label,
                    expect.any(Number: any),
                    expect.any(Number: any)
                );
            });
        });
        
        test('選択されたメニュー項目を強調表示する', () => {
            renderer.updateCoordinateCalculator();
            renderer.renderMenuItems(mockContext, 1, mockMenuItems);
            
            // fillStyleの呼び出しを確認
            const fillStyleCalls: any[] = [];
            const originalFillStyle = mockContext.fillStyle;
            
            mockContext.fillStyle = '';
            Object.defineProperty(mockContext, 'fillStyle', {
                get() { return this._fillStyle; },
                set(value: any) {
                    this._fillStyle = value;
                    fillStyleCalls.push(value: any);
                }
            });
            
            renderer.renderMenuItems(mockContext, 1, mockMenuItems);
            
            // 選択された項目は#0066CC、それ以外は#333333
            expect(fillStyleCalls.filter(c => c === '#0066CC')).toHaveLength(1);
            expect(fillStyleCalls.filter(c => c === '#333333')).toHaveLength(2);
        });
    });
    
    describe('renderControls', () => {
        test('操作説明を画面下部に描画する', () => {
            renderer.updateCoordinateCalculator();
            renderer.renderControls(mockContext: any);
            
            expect(mockContext.fillText).toHaveBeenCalledWith(
                '↑↓: 選択  Enter: 決定  ESC: 終了',
                expect.any(Number: any),
                expect.any(Number: any)
            );
            
            expect(mockContext.fillText).toHaveBeenCalledWith(
                'クリックでも操作できます',
                expect.any(Number: any),
                expect.any(Number: any)
            );
        });
        
        test('Canvas状態を保存・復元する', () => {
            renderer.updateCoordinateCalculator();
            const saveCallsBefore = mockContext.save.mock.calls.length;
            const restoreCallsBefore = mockContext.restore.mock.calls.length;
            
            renderer.renderControls(mockContext: any);
            
            expect(mockContext.save).toHaveBeenCalledTimes(saveCallsBefore + 1);
            expect(mockContext.restore).toHaveBeenCalledTimes(restoreCallsBefore + 1);
        });
    });
    
    describe('レスポンシブ動作', () => {
        test('異なる画面サイズで正しくスケーリングされる', () => {
            // 小さい画面サイズに変更
            mockCanvas.width = 800;
            mockCanvas.height = 600;
            
            renderer.renderMainMenu(mockContext, 0, [{ label: 'Test' }]);
            
            // CoordinateCalculatorが正しいサイズで初期化される
            expect(renderer.coordinateCalculator.canvasWidth).toBe(800);
            expect(renderer.coordinateCalculator.canvasHeight).toBe(600);
            expect(renderer.coordinateCalculator.uniformScale).toBeLessThan(1);
        });
    });
});