/**
 * Canvas Scale UI Positioning Integration Tests
 * キャンバススケール UI配置システムの統合テスト
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';

describe('Canvas Scale UI Positioning Integration Tests', () => {
    let dom: any;
    let canvas: any;
    let responsiveCanvasManager: any;
    let scaledCoordinateManager: any;
    let gameUIManager: any;

    beforeAll(() => {
        // JSDOM環境のセットアップ
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <canvas id="gameCanvas" width="800" height="600"></canvas>
                </body>
            </html>
        `, {
            pretendToBeVisual: true,
            resources: "usable"
        });

        global.window = dom.window;
        global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
        global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
        global.performance = dom.window.performance;
        global.requestAnimationFrame = dom.window.requestAnimationFrame;
        
        // Canvas 2D context のモック
        const mockContext = {
            save: jest.fn(),
            restore: jest.fn(),
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            drawImage: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            setTransform: jest.fn(),
            transform: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            fillStyle: '#000',
            strokeStyle: '#000',
            lineWidth: 1,
            font: '10px sans-serif',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            canvas: null
        };

        HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
        
        canvas = document.getElementById('gameCanvas');
        mockContext.canvas = canvas;
    });

    beforeEach(async () => {
        // 各テスト前にコンポーネントを初期化
        const { ResponsiveCanvasManager } = await import('../../src/ui/managers/ResponsiveCanvasManager.js');
        const { ScaledCoordinateManager } = await import('../../src/utils/ScaledCoordinateManager.js');
        const { GameUIManager } = await import('../../src/ui/managers/GameUIManager.js');
        
        responsiveCanvasManager = new ResponsiveCanvasManager(canvas;
        scaledCoordinateManager = new ScaledCoordinateManager(responsiveCanvasManager;
        gameUIManager = new GameUIManager(responsiveCanvasManager;
        
        // モックの初期化
        jest.clearAllMocks();
    });

    describe('ResponsiveCanvasManager Integration', () => {
        test('should integrate ScaledCoordinateManager with ResponsiveCanvasManager', async () => {
            // ResponsiveCanvasManagerの初期化
            responsiveCanvasManager.initialize();
            
            // ScaleChangeイベントハンドラーの確認
            expect(responsiveCanvasManager.scaledCoordinateManager).toBeDefined();
            
            // キャンバスサイズ変更をシミュレート
            Object.defineProperty(canvas, 'clientWidth', { value: 1200, configurable: true });
            Object.defineProperty(canvas, 'clientHeight', { value: 900, configurable: true });
            
            responsiveCanvasManager.updateCanvasSize();
            
            // スケール変更が適切に処理されることを確認
            const scaleInfo = scaledCoordinateManager.getCanvasInfo();
            expect(scaleInfo.scaleFactor).toBeGreaterThan(0);
            expect(scaleInfo.displayWidth).toBe(1200);
            expect(scaleInfo.displayHeight).toBe(900);
        });

        test('should handle canvas resize events correctly', async () => {
            const onScaleChangeMock = jest.fn() as jest.Mock;
            scaledCoordinateManager.onScaleChange(onScaleChangeMock;
            
            // 複数のリサイズイベントをシミュレート
            const resizeSizes = [
                { width: 800, height: 600 },
                { width: 1200, height: 800 },
                { width: 480, height: 320 },  // モバイルサイズ
                { width: 1920, height: 1080 } // デスクトップサイズ
            ];
            
            for (const size of resizeSizes) {
                Object.defineProperty(canvas, 'clientWidth', { value: size.width, configurable: true });
                Object.defineProperty(canvas, 'clientHeight', { value: size.height, configurable: true });
                
                responsiveCanvasManager.updateCanvasSize();
                
                // スケール変更イベントが呼び出されることを確認
                expect(onScaleChangeMock.toHaveBeenCalled();
                
                // 座標変換が正常に動作することを確認
                const scaledPos = scaledCoordinateManager.getScaledPosition(100, 100);
                expect(scaledPos.x).toBeGreaterThan(0);
                expect(scaledPos.y).toBeGreaterThan(0);
            }
        });
    });

    describe('UI Element Positioning across Different Screen Sizes', () => {
        test('should position UI elements correctly on desktop', async () => {
            // デスクトップサイズ設定
            simulateScreenSize(1920, 1080);
            
            // UI要素の配置テスト
            const testPositions = testUIElementPositioning();
            
            // デスクトップでの適切な配置を確認
            expect(testPositions.score.x).toBeGreaterThan(0);
            expect(testPositions.score.y).toBeGreaterThan(0);
            expect(testPositions.hp.x).toBeGreaterThan(0);
            expect(testPositions.time.x).toBeGreaterThan(0);
            
            // 右寄せ要素（コンボ表示）の確認
            expect(testPositions.combo.x).toBeGreaterThan(testPositions.score.x);
        });

        test('should position UI elements correctly on tablet', async () => {
            // タブレットサイズ設定
            simulateScreenSize(1024, 768);
            
            const testPositions = testUIElementPositioning();
            
            // タブレットでの適切な配置を確認
            expect(testPositions.score.x).toBeGreaterThan(0);
            expect(testPositions.score.y).toBeGreaterThan(0);
            
            // レスポンシブマージンが適用されていることを確認
            const { UIPositionCalculator } = await import('../../src/utils/UIPositionCalculator.js');
            const positionCalculator = new UIPositionCalculator(scaledCoordinateManager;
            const margins = positionCalculator.getResponsiveMargins();
            
            expect(margins.top).toBeDefined();
            expect(margins.left).toBeDefined();
        });

        test('should position UI elements correctly on mobile', async () => {
            // モバイルサイズ設定
            simulateScreenSize(375, 812);
            
            const testPositions = testUIElementPositioning();
            
            // モバイルでの適切な配置を確認
            expect(testPositions.score.x).toBeGreaterThan(0);
            expect(testPositions.score.y).toBeGreaterThan(0);
            
            // モバイル特有のレイアウト調整を確認
            const canvasInfo = scaledCoordinateManager.getCanvasInfo();
            expect(canvasInfo.scaleFactor).toBeDefined();
        });

        test('should handle orientation changes', async () => {
            // ポートレート（縦向き）
            simulateScreenSize(375, 812);
            const portraitPositions = testUIElementPositioning();
            
            // ランドスケープ（横向き）
            simulateScreenSize(812, 375);
            const landscapePositions = testUIElementPositioning();
            
            // 向きが変わってもUI要素が適切に配置されることを確認
            expect(portraitPositions.score.x).toBeGreaterThan(0);
            expect(landscapePositions.score.x).toBeGreaterThan(0);
            
            // アスペクト比の違いに応じた配置の調整を確認
            expect(portraitPositions.score.x).not.toBe(landscapePositions.score.x);
        });
    });

    describe('Input Handling Accuracy with Scaling', () => {
        test('should convert mouse events correctly across different scales', async () => {
            const { InputCoordinateConverter } = await import('../../src/utils/InputCoordinateConverter.js');
            const inputConverter = new InputCoordinateConverter(scaledCoordinateManager;
            
            // 異なるスケールでのマウスイベントテスト
            const testScales = [
                { width: 800, height: 600, scale: 1.0 },
                { width: 1200, height: 900, scale: 1.5 },
                { width: 400, height: 300, scale: 0.5 }
            ];
            
            for (const testCase of testScales) {
                simulateScreenSize(testCase.width, testCase.height);
                
                const mockEvent = {
                    clientX: 100,
                    clientY: 100,
                    type: 'click'
                };
                
                const convertedEvent = inputConverter.convertMouseEvent(mockEvent;
                
                // 座標変換が正常に動作することを確認
                expect(convertedEvent.canvasX).toBeDefined();
                expect(convertedEvent.canvasY).toBeDefined();
                expect(convertedEvent.baseX).toBeDefined();
                expect(convertedEvent.baseY).toBeDefined();
                
                // 変換された座標が妥当な範囲内であることを確認
                expect(convertedEvent.canvasX).toBeGreaterThanOrEqual(0);
                expect(convertedEvent.canvasY).toBeGreaterThanOrEqual(0);
            }
        });

        test('should handle touch events correctly on mobile', async () => {
            const { InputCoordinateConverter } = await import('../../src/utils/InputCoordinateConverter.js');
            const inputConverter = new InputCoordinateConverter(scaledCoordinateManager;
            
            // モバイルサイズ設定
            simulateScreenSize(375, 812);
            
            const mockTouchEvent = {
                touches: [{
                    clientX: 200,
                    clientY: 400
                }],
                type: 'touchstart'
            };
            
            const convertedEvent = inputConverter.convertTouchEvent(mockTouchEvent;
            
            // タッチイベント変換が正常に動作することを確認
            expect(convertedEvent.canvasX).toBeDefined();
            expect(convertedEvent.canvasY).toBeDefined();
            expect(convertedEvent.baseX).toBeDefined();
            expect(convertedEvent.baseY).toBeDefined();
        });

        test('should perform accurate hit testing', async () => {
            const { InputCoordinateConverter } = await import('../../src/utils/InputCoordinateConverter.js');
            const inputConverter = new InputCoordinateConverter(scaledCoordinateManager;
            
            // ヒットテストのテストケース
            const testCases = [
                {
                    point: { x: 150, y: 150 },
                    rect: { x: 100, y: 100, width: 100, height: 100 },
                    expected: true
                },
                {
                    point: { x: 50, y: 50 },
                    rect: { x: 100, y: 100, width: 100, height: 100 },
                    expected: false
                },
                {
                    point: { x: 200, y: 200 },
                    circle: { x: 200, y: 200, radius: 50 },
                    expected: true
                },
                {
                    point: { x: 300, y: 300 },
                    circle: { x: 200, y: 200, radius: 50 },
                    expected: false
                }
            ];
            
            for (const testCase of testCases) {
                if (testCase.rect) {
                    const result = inputConverter.isPointInScaledRect(testCase.point, testCase.rect);
                    expect(result.toBe(testCase.expected);
                }
                
                if (testCase.circle) {
                    const result = inputConverter.isPointInScaledCircle(testCase.point, testCase.circle, testCase.circle.radius);
                    expect(result.toBe(testCase.expected);
                }
            }
        });
    });

    describe('Performance Impact Assessment', () => {
        test('should maintain acceptable performance with coordinate calculations', async () => {
            const startTime = performance.now();
            
            // 大量の座標計算を実行
            for (let i = 0; i < 1000; i++) {
                scaledCoordinateManager.getScaledPosition(i % 800, i % 600);
                scaledCoordinateManager.getScaledSize(50, 30);
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // 座標計算のパフォーマンスが許容範囲内であることを確認
            expect(executionTime.toBeLessThan(100); // 100ms以下
        });

        test('should handle rapid resize events without performance degradation', async () => {
            const startTime = performance.now();
            
            // 連続的なリサイズイベントをシミュレート
            for (let i = 0; i < 50; i++) {
                const width = 800 + (i * 10);
                const height = 600 + (i * 7.5);
                simulateScreenSize(width, height);
                
                // 各リサイズ後の座標計算
                scaledCoordinateManager.getScaledPosition(100, 100);
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // 連続リサイズ処理のパフォーマンスが許容範囲内であることを確認
            expect(executionTime.toBeLessThan(200); // 200ms以下
        });
    });

    // ヘルパー関数
    function simulateScreenSize(width, height) {
        Object.defineProperty(canvas, 'clientWidth', { value: width, configurable: true });
        Object.defineProperty(canvas, 'clientHeight', { value: height, configurable: true });
        responsiveCanvasManager.updateCanvasSize();
    }

    function testUIElementPositioning() {
        const mockGameState = {
            score: 12345,
            hp: 85,
            timeRemaining: 120,
            combo: 7
        };
        
        // GameUIManagerを使ってUI要素をレンダリング
        const context = canvas.getContext('2d');
        gameUIManager.renderAnimatedScore(context, mockGameState.score);
        gameUIManager.renderHPDisplay(context, mockGameState.hp);
        gameUIManager.renderTimeDisplay(context, mockGameState.timeRemaining);
        gameUIManager.renderComboDisplay(context, mockGameState.combo);
        
        // レンダリング呼び出しから座標を抽出
        const fillTextCalls = context.fillText.mock.calls;
        const fillRectCalls = context.fillRect.mock.calls;
        
        // 各UI要素の位置を抽出（モック呼び出しから）
        return {
            score: { x: fillTextCalls[0]?.[1] || 0, y: fillTextCalls[0]?.[2] || 0 },
            hp: { x: fillTextCalls[1]?.[1] || 0, y: fillTextCalls[1]?.[2] || 0 },
            time: { x: fillTextCalls[2]?.[1] || 0, y: fillTextCalls[2]?.[2] || 0 },
            combo: { x: fillTextCalls[3]?.[1] || 0, y: fillTextCalls[3]?.[2] || 0 }
        };
    }
});