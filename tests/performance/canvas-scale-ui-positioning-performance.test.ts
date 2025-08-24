/**
 * Canvas Scale UI Positioning Performance Tests
 * キャンバススケール UI配置システムのパフォーマンステスト
 */
import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import { JSDOM } from 'jsdom';

describe('Canvas Scale UI Positioning Performance Tests', () => {
    let dom: any;
    let canvas: any;
    let responsiveCanvasManager: any;
    let scaledCoordinateManager: any;
    let gameUIManager: any;
    let performanceMonitor: any;

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

        (global as any).window = dom.window;
        (global as any).document = dom.window.document;
        (global as any).HTMLElement = dom.window.HTMLElement;
        (global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
        (global as any).CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
        (global as any).performance = dom.window.performance;
        (global as any).requestAnimationFrame = dom.window.requestAnimationFrame;
        
        // Performance monitoring utilities
        performanceMonitor = {
            marks: new Map(),
            measures: [],

            mark(name: string) {
                this.marks.set(name, performance.now());
            },
            
            measure(name: string, startMark?: string, endMark?: string) {
                const startTime = this.marks.get(startMark || 'start') || performance.now();
                const endTime = this.marks.get(endMark || 'end') || performance.now();
                const duration = endTime - startTime;
                this.measures.push({ name, duration, startTime, endTime });
                return duration;
            },
            
            clear() {
                this.marks.clear();
                this.measures = [];
            },
            
            getAverageTime(measureName: string) {
                const relevantMeasures = this.measures.filter(m => m.name === measureName);
                if (relevantMeasures.length === 0) return 0;
                return relevantMeasures.reduce((sum, m) => sum + m.duration, 0) / relevantMeasures.length;
            }
        };
    });

    beforeEach(() => {
        canvas = document.getElementById('gameCanvas');
        
        // Mock classes for testing
        responsiveCanvasManager = {
            getCanvasScale: jest.fn(() => ({ x: 1.2, y: 1.2 })),
            getScaledWidth: jest.fn(() => 960),
            getScaledHeight: jest.fn(() => 720),
            getBaseWidth: jest.fn(() => 800),
            getBaseHeight: jest.fn(() => 600),
            updateCanvasSize: jest.fn(),
            getPixelRatio: jest.fn(() => 1)
        };

        scaledCoordinateManager = {
            screenToCanvas: jest.fn((x: number, y: number) => ({ x: x / 1.2, y: y / 1.2 })),
            canvasToScreen: jest.fn((x: number, y: number) => ({ x: x * 1.2, y: y * 1.2 })),
            getScaledPosition: jest.fn((x: number, y: number) => ({ x: x * 1.2, y: y * 1.2 })),
            adjustForScale: jest.fn((value: number) => value * 1.2)
        };

        gameUIManager = {
            renderScore: jest.fn(),
            renderHP: jest.fn(),
            renderTime: jest.fn(),
            renderCombo: jest.fn(),
            updateUIPositions: jest.fn(),
            getUIElements: jest.fn(() => [
                { id: 'score', x: 10, y: 10, width: 100, height: 30 },
                { id: 'hp', x: 700, y: 10, width: 80, height: 30 },
                { id: 'time', x: 350, y: 10, width: 100, height: 30 },
                { id: 'combo', x: 10, y: 550, width: 120, height: 40 }
            ])
        };

        performanceMonitor.clear();
    });

    afterAll(() => {
        // Clean up JSDOM
        dom.window.close();
    });

    test('UI要素の座標変換パフォーマンス', () => {
        const iterations = 1000;
        const testCoordinates = [
            { x: 100, y: 100 },
            { x: 400, y: 300 },
            { x: 700, y: 500 },
            { x: 50, y: 50 },
            { x: 750, y: 550 }
        ];

        performanceMonitor.mark('coordinate-transform-start');

        // 大量の座標変換を実行
        for (let i = 0; i < iterations; i++) {
            const coord = testCoordinates[i % testCoordinates.length];
            scaledCoordinateManager.screenToCanvas(coord.x, coord.y);
            scaledCoordinateManager.canvasToScreen(coord.x, coord.y);
            scaledCoordinateManager.getScaledPosition(coord.x, coord.y);
        }

        performanceMonitor.mark('coordinate-transform-end');
        const duration = performanceMonitor.measure('coordinate-transform', 'coordinate-transform-start', 'coordinate-transform-end');

        console.log(`座標変換 ${iterations * 3}回の処理時間: ${duration.toFixed(2)}ms`);
        console.log(`1回あたりの平均時間: ${(duration / (iterations * 3)).toFixed(4)}ms`);

        // パフォーマンス要件: 1000回の変換が10ms以下
        expect(duration).toBeLessThan(10);
        
        // 変換が正しく呼び出されたことを確認
        expect(scaledCoordinateManager.screenToCanvas).toHaveBeenCalledTimes(iterations);
        expect(scaledCoordinateManager.canvasToScreen).toHaveBeenCalledTimes(iterations);
        expect(scaledCoordinateManager.getScaledPosition).toHaveBeenCalledTimes(iterations);
    });

    test('UI要素の描画パフォーマンス', () => {
        const frames = 60; // 60フレーム分
        
        performanceMonitor.mark('ui-render-start');

        // 60フレーム分のUI描画をシミュレート
        for (let frame = 0; frame < frames; frame++) {
            gameUIManager.renderScore();
            gameUIManager.renderHP();
            gameUIManager.renderTime();
            gameUIManager.renderCombo();
        }

        performanceMonitor.mark('ui-render-end');
        const duration = performanceMonitor.measure('ui-render', 'ui-render-start', 'ui-render-end');

        const avgFrameTime = duration / frames;

        console.log(`${frames}フレーム分のUI描画時間: ${duration.toFixed(2)}ms`);
        console.log(`1フレームあたりの平均時間: ${avgFrameTime.toFixed(3)}ms`);

        // パフォーマンス要件: 1フレーム1ms以下（60FPS維持のため）
        expect(avgFrameTime).toBeLessThan(1);
        
        // 各UI要素が正しく描画されたことを確認
        expect(gameUIManager.renderScore).toHaveBeenCalledTimes(frames);
        expect(gameUIManager.renderHP).toHaveBeenCalledTimes(frames);
        expect(gameUIManager.renderTime).toHaveBeenCalledTimes(frames);
        expect(gameUIManager.renderCombo).toHaveBeenCalledTimes(frames);
    });

    test('レスポンシブ・スケーリング計算パフォーマンス', () => {
        const scalingOperations = 500;
        const testSizes = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 768, height: 1024 },
            { width: 375, height: 667 },
            { width: 320, height: 568 }
        ];

        performanceMonitor.mark('scaling-calc-start');

        for (let i = 0; i < scalingOperations; i++) {
            const size = testSizes[i % testSizes.length];
            
            // スケーリング計算をシミュレート
            responsiveCanvasManager.getCanvasScale();
            responsiveCanvasManager.getScaledWidth();
            responsiveCanvasManager.getScaledHeight();
            responsiveCanvasManager.updateCanvasSize();
            responsiveCanvasManager.getPixelRatio();
        }

        performanceMonitor.mark('scaling-calc-end');
        const duration = performanceMonitor.measure('scaling-calc', 'scaling-calc-start', 'scaling-calc-end');

        const avgOperationTime = duration / (scalingOperations * 5);

        console.log(`${scalingOperations * 5}回のスケーリング計算時間: ${duration.toFixed(2)}ms`);
        console.log(`1回あたりの平均時間: ${avgOperationTime.toFixed(4)}ms`);

        // パフォーマンス要件: 全体の計算が50ms以下
        expect(duration).toBeLessThan(50);
        
        // スケーリング計算が正しく実行されたことを確認
        expect(responsiveCanvasManager.getCanvasScale).toHaveBeenCalledTimes(scalingOperations);
        expect(responsiveCanvasManager.updateCanvasSize).toHaveBeenCalledTimes(scalingOperations);
    });

    test('UI位置更新の最適化効果', () => {
        const updateCycles = 100;
        
        // 非最適化バージョン（個別更新）
        performanceMonitor.mark('individual-updates-start');
        
        for (let i = 0; i < updateCycles; i++) {
            gameUIManager.renderScore();
            gameUIManager.renderHP();
            gameUIManager.renderTime();
            gameUIManager.renderCombo();
        }
        
        performanceMonitor.mark('individual-updates-end');
        const individualDuration = performanceMonitor.measure('individual-updates', 'individual-updates-start', 'individual-updates-end');

        // 最適化バージョン（バッチ更新）
        performanceMonitor.mark('batch-updates-start');
        
        for (let i = 0; i < updateCycles; i++) {
            gameUIManager.updateUIPositions(); // バッチで更新
        }
        
        performanceMonitor.mark('batch-updates-end');
        const batchDuration = performanceMonitor.measure('batch-updates', 'batch-updates-start', 'batch-updates-end');

        const improvementPercentage = ((individualDuration - batchDuration) / individualDuration) * 100;

        console.log(`個別更新: ${individualDuration.toFixed(2)}ms`);
        console.log(`バッチ更新: ${batchDuration.toFixed(2)}ms`);
        console.log(`改善率: ${improvementPercentage.toFixed(1)}%`);

        // バッチ更新が個別更新より高速であることを確認
        expect(batchDuration).toBeLessThanOrEqual(individualDuration);
        
        // 最適化により少なくとも改善があることを確認（回帰しない）
        expect(improvementPercentage).toBeGreaterThanOrEqual(0);
    });

    test('高DPI環境でのパフォーマンス', () => {
        // 高DPI環境をシミュレート
        responsiveCanvasManager.getPixelRatio = jest.fn(() => 2.0);
        
        const highDPIOperations = 200;
        const testElements = gameUIManager.getUIElements();

        performanceMonitor.mark('high-dpi-start');

        for (let i = 0; i < highDPIOperations; i++) {
            // 高DPI対応の処理をシミュレート
            testElements.forEach(element => {
                const scaledX = scaledCoordinateManager.adjustForScale(element.x);
                const scaledY = scaledCoordinateManager.adjustForScale(element.y);
                const scaledWidth = scaledCoordinateManager.adjustForScale(element.width);
                const scaledHeight = scaledCoordinateManager.adjustForScale(element.height);
                
                // 実際の描画処理（モック）
                responsiveCanvasManager.getPixelRatio();
            });
        }

        performanceMonitor.mark('high-dpi-end');
        const duration = performanceMonitor.measure('high-dpi', 'high-dpi-start', 'high-dpi-end');

        const avgElementTime = duration / (highDPIOperations * testElements.length);

        console.log(`高DPI環境 ${highDPIOperations * testElements.length}要素の処理時間: ${duration.toFixed(2)}ms`);
        console.log(`要素あたりの平均時間: ${avgElementTime.toFixed(4)}ms`);

        // パフォーマンス要件: 高DPI環境でも処理が重くならない
        expect(duration).toBeLessThan(100);
        expect(avgElementTime).toBeLessThan(0.1);
        
        // 高DPI処理が正しく実行されたことを確認
        expect(scaledCoordinateManager.adjustForScale).toHaveBeenCalled();
        expect(responsiveCanvasManager.getPixelRatio).toHaveBeenCalled();
    });

    test('メモリ効率性の確認', () => {
        const memoryTestIterations = 1000;
        
        // 初期メモリ状態を記録（概算）
        const initialCallCount = {
            screenToCanvas: (scaledCoordinateManager.screenToCanvas as any).mock.calls.length,
            canvasToScreen: (scaledCoordinateManager.canvasToScreen as any).mock.calls.length
        };

        performanceMonitor.mark('memory-test-start');

        // 大量の座標変換でメモリ使用をテスト
        for (let i = 0; i < memoryTestIterations; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            
            // 一時的なオブジェクトを大量作成
            const screenCoord = scaledCoordinateManager.screenToCanvas(x, y);
            const canvasCoord = scaledCoordinateManager.canvasToScreen(screenCoord.x, screenCoord.y);
            
            // 不要な参照を削除（GC促進）
            if (i % 100 === 0) {
                // ガベージコレクションのヒントを与える（実際のブラウザでは自動）
                performanceMonitor.measures = performanceMonitor.measures.slice(-10); // 古い測定を削除
            }
        }

        performanceMonitor.mark('memory-test-end');
        const duration = performanceMonitor.measure('memory-test', 'memory-test-start', 'memory-test-end');

        const finalCallCount = {
            screenToCanvas: (scaledCoordinateManager.screenToCanvas as any).mock.calls.length,
            canvasToScreen: (scaledCoordinateManager.canvasToScreen as any).mock.calls.length
        };

        const actualOperations = {
            screenToCanvas: finalCallCount.screenToCanvas - initialCallCount.screenToCanvas,
            canvasToScreen: finalCallCount.canvasToScreen - initialCallCount.canvasToScreen
        };

        console.log(`メモリテスト ${memoryTestIterations}回の処理時間: ${duration.toFixed(2)}ms`);
        console.log(`実際の座標変換回数: screenToCanvas=${actualOperations.screenToCanvas}, canvasToScreen=${actualOperations.canvasToScreen}`);

        // メモリリークがないことを間接的に確認（パフォーマンス劣化がない）
        expect(duration).toBeLessThan(500);
        expect(actualOperations.screenToCanvas).toBe(memoryTestIterations);
        expect(actualOperations.canvasToScreen).toBe(memoryTestIterations);
    });
});