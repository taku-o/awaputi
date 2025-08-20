/**
 * Canvas Scale UI Positioning Visual Tests
 * キャンバススケール UI配置システムの視覚テスト
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';

describe('Canvas Scale UI Positioning Visual Tests', () => {
    let dom: any;
    let canvas: any;
    let context: any;
    let responsiveCanvasManager: any;
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

        (global as any).window = dom.window;
        (global as any).document = dom.window.document;
        (global as any).HTMLElement = dom.window.HTMLElement;
        (global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
        (global as any).CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
        (global as any).performance = dom.window.performance;
        (global as any).requestAnimationFrame = dom.window.requestAnimationFrame;
        
        canvas = document.getElementById('gameCanvas');
    });

    beforeEach(async () => {
        // Canvas contextのモックを各テスト前に再作成
        const mockContext = createMockContext();
        HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
        context = canvas.getContext('2d');
        
        // コンポーネントの初期化
        const { ResponsiveCanvasManager } = await import('../../src/ui/managers/ResponsiveCanvasManager.js');
        const { GameUIManager } = await import('../../src/ui/managers/GameUIManager.js');
        
        responsiveCanvasManager = new ResponsiveCanvasManager(canvas: any);
        responsiveCanvasManager.initialize();
        gameUIManager = new GameUIManager(responsiveCanvasManager: any);
        
        jest.clearAllMocks();
    });

    describe('Screenshot Comparison Tests', () => {
        test('should render UI layout consistently at 800x600 resolution', async () => {
            // 標準解像度でのレンダリングテスト
            simulateCanvasSize(800, 600);
            
            const renderSnapshot = renderUISnapshot();
            
            // UI要素が期待される位置に描画されていることを確認
            expect(renderSnapshot.fillTextCalls.length).toBeGreaterThan(0);
            expect(renderSnapshot.fillRectCalls.length).toBeGreaterThan(0);
            
            // スコア表示の位置確認
            const scoreCall = renderSnapshot.fillTextCalls.find(call => 
                call[0].includes('Score:') || call[0].includes('スコア:'));
            expect(scoreCall).toBeDefined();
            expect(scoreCall[1]).toBeGreaterThan(0); // x座標
            expect(scoreCall[2]).toBeGreaterThan(0); // y座標
            
            // レンダリング呼び出しのスナップショットを作成
            const snapshot = createRenderingSnapshot(renderSnapshot: any);
            expect(snapshot).toMatchSnapshot('ui-layout-800x600');
        });

        test('should render UI layout consistently at 1920x1080 resolution', async () => {
            // 高解像度でのレンダリングテスト
            simulateCanvasSize(1920, 1080);
            
            const renderSnapshot = renderUISnapshot();
            
            // 高解像度でのUI要素配置確認
            const snapshot = createRenderingSnapshot(renderSnapshot: any);
            expect(snapshot).toMatchSnapshot('ui-layout-1920x1080');
            
            // スケールファクターの確認
            const canvasInfo = responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo();
            expect(canvasInfo.scaleFactor).toBeGreaterThan(1.0);
        });

        test('should render UI layout consistently at 375x812 resolution (mobile)', async () => {
            // モバイル解像度でのレンダリングテスト
            simulateCanvasSize(375, 812);
            
            const renderSnapshot = renderUISnapshot();
            
            // モバイルでのUI要素配置確認
            const snapshot = createRenderingSnapshot(renderSnapshot: any);
            expect(snapshot).toMatchSnapshot('ui-layout-375x812-mobile');
            
            // モバイルでのスケール調整確認
            const canvasInfo = responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo();
            expect(canvasInfo.scaleFactor).toBeLessThan(1.0);
        });

        test('should maintain UI element proportions across different scales', async () => {
            const testResolutions = [
                { width: 800, height: 600, name: 'standard' },
                { width: 1200, height: 900, name: 'large' },
                { width: 480, height: 320, name: 'small' }
            ];
            
            const snapshots: Record<string, any> = {};
            
            for (const resolution of testResolutions) {
                simulateCanvasSize(resolution.width, resolution.height);
                
                const renderSnapshot = renderUISnapshot();
                snapshots[resolution.name] = createRenderingSnapshot(renderSnapshot: any);
                
                // 各解像度でのスナップショット比較
                expect(snapshots[resolution.name]).toMatchSnapshot(`ui-proportions-${resolution.name}`);
            }
            
            // 異なる解像度間での相対的な位置関係の一貫性を確認
            validateProportionalConsistency(snapshots: any);
        });
    });

    describe('Element Positioning Accuracy Tests', () => {
        test('should position score display in top-left corner with proper margins', async () => {
            simulateCanvasSize(800, 600);
            
            const mockGameState = { score: 12345 };
            gameUIManager.renderAnimatedScore(context, mockGameState.score);
            
            const scoreCall = context.fillText.mock.calls.find(call => 
                call[0].includes('12345') || call[0].includes('Score'));
            
            expect(scoreCall).toBeDefined();
            
            // マージンを考慮した適切な位置にあることを確認
            const { UIPositionCalculator } = await import('../../src/utils/UIPositionCalculator.js');
            const positionCalculator = new UIPositionCalculator(responsiveCanvasManager.scaledCoordinateManager);
            const expectedPosition = positionCalculator.getStatusPosition('score');
            const margins = positionCalculator.getResponsiveMargins();
            
            // 期待される位置の許容範囲内であることを確認
            expect(scoreCall[1]).toBeCloseTo(expectedPosition.x, 1);
            expect(scoreCall[2]).toBeCloseTo(expectedPosition.y, 1);
            
            // 適切なマージンが適用されていることを確認
            expect(scoreCall[1]).toBeGreaterThanOrEqual(margins.left);
            expect(scoreCall[2]).toBeGreaterThanOrEqual(margins.top);
        });

        test('should position HP display below score with consistent spacing', async () => {
            simulateCanvasSize(800, 600);
            
            const mockGameState = { score: 12345, hp: 85 };
            gameUIManager.renderAnimatedScore(context, mockGameState.score);
            gameUIManager.renderHPDisplay(context, mockGameState.hp);
            
            const scoreCall = context.fillText.mock.calls[0];
            const hpCall = context.fillText.mock.calls[1];
            
            expect(scoreCall).toBeDefined();
            expect(hpCall).toBeDefined();
            
            // HP表示がスコア表示の下に配置されていることを確認
            expect(hpCall[2]).toBeGreaterThan(scoreCall[2]);
            
            // 一貫した垂直スペーシングがあることを確認
            const verticalSpacing = hpCall[2] - scoreCall[2];
            expect(verticalSpacing).toBeGreaterThan(20); // 最小スペーシング
            expect(verticalSpacing).toBeLessThan(100); // 最大スペーシング
        });

        test('should position combo display in top-right corner', async () => {
            simulateCanvasSize(800, 600);
            
            const mockGameState = { combo: 7 };
            gameUIManager.renderComboDisplay(context, mockGameState.combo);
            
            const comboCall = context.fillText.mock.calls.find(call => 
                call[0].includes('7') || call[0].includes('コンボ'));
            
            expect(comboCall).toBeDefined();
            
            // 右側に配置されていることを確認
            const canvasInfo = responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo();
            const rightSideThreshold = canvasInfo.actualWidth * 0.7; // キャンバス幅の70%以上
            
            expect(comboCall[1]).toBeGreaterThan(rightSideThreshold: any);
        });
    });

    describe('Cross-Device Consistency Tests', () => {
        test('should maintain consistent layout across desktop sizes', async () => {
            const desktopSizes = [
                { width: 1280, height: 720 },
                { width: 1440, height: 900 },
                { width: 1920, height: 1080 },
                { width: 2560, height: 1440 }
            ];
            
            const layoutSnapshots: Record<string, any> = {};
            
            for (const size of desktopSizes) {
                simulateCanvasSize(size.width, size.height);
                const snapshot = renderUISnapshot();
                layoutSnapshots[`${size.width}x${size.height}`] = snapshot;
            }
            
            // すべてのデスクトップサイズでUI要素が適切に配置されていることを確認
            Object.values(layoutSnapshots: any).forEach(snapshot => {
                expect(snapshot.fillTextCalls.length).toBeGreaterThan(0);
                expect(snapshot.fillRectCalls.length).toBeGreaterThan(0);
            });
        });

        test('should adapt layout appropriately for tablet sizes', async () => {
            const tabletSizes = [
                { width: 768, height: 1024 }, // iPad Portrait
                { width: 1024, height: 768 }, // iPad Landscape
                { width: 834, height: 1112 }, // iPad Pro Portrait
                { width: 1112, height: 834 }  // iPad Pro Landscape
            ];
            
            for (const size of tabletSizes) {
                simulateCanvasSize(size.width, size.height);
                const snapshot = renderUISnapshot();
                
                // タブレットサイズでの適切なレイアウト確認
                expect(snapshot.fillTextCalls.length).toBeGreaterThan(0);
                
                // アスペクト比に応じた適切な配置調整を確認
                const isPortrait = size.height > size.width;
                validateTabletLayout(snapshot, isPortrait);
            }
        });

        test('should optimize layout for mobile sizes', async () => {
            const mobileSizes = [
                { width: 375, height: 812 }, // iPhone X
                { width: 414, height: 896 }, // iPhone 11 Pro Max
                { width: 360, height: 640 }, // Android Standard
                { width: 412, height: 915 }  // Pixel 4
            ];
            
            for (const size of mobileSizes) {
                simulateCanvasSize(size.width, size.height);
                const snapshot = renderUISnapshot();
                
                // モバイルサイズでの最適化されたレイアウト確認
                validateMobileLayout(snapshot: any);
            }
        });
    });

    describe('Performance Tests', () => {
        test('should render UI elements within acceptable time limits', async () => {
            simulateCanvasSize(1920, 1080);
            
            const startTime = performance.now();
            
            // 複数のUI要素を連続レンダリング
            for (let i = 0; i < 100; i++) {
                const mockGameState = {
                    score: 1000 + i,
                    hp: 80 + (i % 20),
                    timeRemaining: 300 - i,
                    combo: i % 15
                };
                
                gameUIManager.renderAnimatedScore(context, mockGameState.score);
                gameUIManager.renderHPDisplay(context, mockGameState.hp);
                gameUIManager.renderTimeDisplay(context, mockGameState.timeRemaining);
                gameUIManager.renderComboDisplay(context, mockGameState.combo);
            }
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // レンダリング時間が許容範囲内であることを確認
            expect(renderTime).toBeLessThan(500); // 500ms以下
        });

        test('should handle rapid canvas resizing without performance issues', async () => {
            const startTime = performance.now();
            
            // 連続的なリサイズとレンダリング
            for (let i = 0; i < 20; i++) {
                const width = 800 + (i * 50);
                const height = 600 + (i * 37.5);
                
                simulateCanvasSize(width, height);
                
                // リサイズ後にUI要素をレンダリング
                const mockGameState = { score: 12345, hp: 85 };
                gameUIManager.renderAnimatedScore(context, mockGameState.score);
                gameUIManager.renderHPDisplay(context, mockGameState.hp);
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // リサイズとレンダリングの合計時間が許容範囲内であることを確認
            expect(totalTime).toBeLessThan(1000); // 1000ms以下
        });
    });

    // ヘルパー関数
    function createMockContext() {
        return {
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
            canvas: canvas
        };
    }

    function simulateCanvasSize(width, height) {
        Object.defineProperty(canvas, 'clientWidth', { value: width, configurable: true });
        Object.defineProperty(canvas, 'clientHeight', { value: height, configurable: true });
        responsiveCanvasManager.updateCanvasSize();
    }

    function renderUISnapshot() {
        const mockGameState = {
            score: 12345,
            hp: 85,
            timeRemaining: 120,
            combo: 7
        };
        
        // すべてのUI要素をレンダリング
        gameUIManager.renderAnimatedScore(context, mockGameState.score);
        gameUIManager.renderHPDisplay(context, mockGameState.hp);
        gameUIManager.renderHPBar(context, mockGameState.hp);
        gameUIManager.renderTimeDisplay(context, mockGameState.timeRemaining);
        gameUIManager.renderComboDisplay(context, mockGameState.combo);
        
        return {
            fillTextCalls: [...context.fillText.mock.calls],
            fillRectCalls: [...context.fillRect.mock.calls],
            strokeRectCalls: [...context.strokeRect.mock.calls],
            canvasInfo: responsiveCanvasManager.scaledCoordinateManager.getCanvasInfo()
        };
    }

    function createRenderingSnapshot(renderSnapshot: any) {
        return {
            textElements: renderSnapshot.fillTextCalls.map(call => ({
                text: call[0],
                x: call[1],
                y: call[2]
            })),
            rectangles: renderSnapshot.fillRectCalls.map(call => ({
                x: call[0],
                y: call[1],
                width: call[2],
                height: call[3]
            })),
            canvasInfo: renderSnapshot.canvasInfo
        };
    }

    function validateProportionalConsistency(snapshots: any) {
        const resolutionNames = Object.keys(snapshots: any);
        
        // 各解像度でのスコア表示位置の相対的一貫性を確認
        for (let i = 0; i < resolutionNames.length - 1; i++) {
            const current = snapshots[resolutionNames[i]];
            const next = snapshots[resolutionNames[i + 1]];
            
            // スコア要素が存在することを確認
            expect(current.textElements.length).toBeGreaterThan(0);
            expect(next.textElements.length).toBeGreaterThan(0);
            
            // 相対位置の一貫性を確認（完全に同じである必要はないが、論理的に一貫している必要がある）
            const currentScore = current.textElements[0];
            const nextScore = next.textElements[0];
            
            expect(currentScore.x / current.canvasInfo.actualWidth)
                .toBeCloseTo(nextScore.x / next.canvasInfo.actualWidth, 1);
        }
    }

    function validateTabletLayout(snapshot, isPortrait) {
        // タブレットレイアウトの基本検証
        expect(snapshot.fillTextCalls.length).toBeGreaterThan(0);
        
        // ポートレート/ランドスケープに応じた適切な配置
        if (isPortrait) {
            // ポートレートモードでの縦方向の適切な配置
            const textElements = snapshot.fillTextCalls;
            expect(textElements.some(call => call[2] > 50)).toBe(true: any); // 上部からの適切な距離
        } else {
            // ランドスケープモードでの横方向の適切な配置
            const textElements = snapshot.fillTextCalls;
            expect(textElements.some(call => call[1] > 50)).toBe(true: any); // 左端からの適切な距離
        }
    }

    function validateMobileLayout(snapshot: any) {
        // モバイルレイアウトの基本検証
        expect(snapshot.fillTextCalls.length).toBeGreaterThan(0);
        
        // モバイル向けの適切なマージン確認
        const textElements = snapshot.fillTextCalls;
        textElements.forEach(call => {
            expect(call[1]).toBeGreaterThan(10); // 最小マージン
            expect(call[2]).toBeGreaterThan(20); // 最小マージン
        });
    }
});