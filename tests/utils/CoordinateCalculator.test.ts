import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { CoordinateCalculator } from '../../src/utils/CoordinateCalculator';

describe('CoordinateCalculator', () => {
    let calculator: any;
    
    beforeEach(() => {
        // デフォルトのCanvasサイズでインスタンス化
        calculator = new CoordinateCalculator(1920, 1080);
    });
    
    describe('コンストラクタ', () => {
        test('デフォルト値で正しく初期化される', () => {
            expect(calculator.canvasWidth).toBe(1920);
            expect(calculator.canvasHeight).toBe(1080);
            expect(calculator.baseWidth).toBe(1920);
            expect(calculator.baseHeight).toBe(1080);
            expect(calculator.scaleX).toBe(1);
            expect(calculator.scaleY).toBe(1);
            expect(calculator.uniformScale).toBe(1);
        });
        
        test('カスタムベースサイズで初期化できる', () => {
            const customCalc = new CoordinateCalculator(960, 540, 1920, 1080);
            expect(customCalc.scaleX).toBe(0.5);
            expect(customCalc.scaleY).toBe(0.5);
            expect(customCalc.uniformScale).toBe(0.5);
        });
    });
    
    describe('updateCanvasDimensions', () => {
        test('Canvas寸法とスケール係数を正しく更新する', () => {
            calculator.updateCanvasDimensions(960, 540);
            expect(calculator.canvasWidth).toBe(960);
            expect(calculator.canvasHeight).toBe(540);
            expect(calculator.scaleX).toBe(0.5);
            expect(calculator.scaleY).toBe(0.5);
            expect(calculator.uniformScale).toBe(0.5);
        });
        
        test('異なるアスペクト比で最小スケールを選択する', () => {
            calculator.updateCanvasDimensions(1280, 1080);
            expect(calculator.scaleX).toBeCloseTo(0.667, 3);
            expect(calculator.scaleY).toBe(1);
            expect(calculator.uniformScale).toBeCloseTo(0.667, 3);
        });
    });
    
    describe('座標変換', () => {
        test('toCanvasCoordinatesが正しく変換する', () => {
            calculator.updateCanvasDimensions(960, 540);
            const result = calculator.toCanvasCoordinates(100, 200);
            expect(result.x).toBe(50);
            expect(result.y).toBe(100);
        });
        
        test('toCanvasSizeが正しくサイズを変換する', () => {
            calculator.updateCanvasDimensions(960, 540);
            const result = calculator.toCanvasSize(200, 100);
            expect(result.width).toBe(100);
            expect(result.height).toBe(50);
        });
    });
    
    describe('中央配置計算', () => {
        test('getCenterXが要素を水平中央に配置する', () => {
            calculator.updateCanvasDimensions(1000, 600);
            const centerX = calculator.getCenterX(200); // ベース座標系での幅
            const scaledWidth = 200 * (1000 / 1920);
            expect(centerX).toBe((1000 - scaledWidth) / 2);
        });
        
        test('getCenterYが要素を垂直中央に配置する', () => {
            calculator.updateCanvasDimensions(1000, 600);
            const centerY = calculator.getCenterY(100); // ベース座標系での高さ
            const scaledHeight = 100 * (600 / 1080);
            expect(centerY).toBe((600 - scaledHeight) / 2);
        });
    });
    
    describe('フォントサイズスケーリング', () => {
        test('uniformScaleに基づいてフォントサイズをスケーリングする', () => {
            calculator.updateCanvasDimensions(960, 540);
            expect(calculator.scaleFontSize(60)).toBe(30);
            expect(calculator.scaleFontSize(24)).toBe(12);
        });
        
        test('異なるアスペクト比で最小スケールを使用する', () => {
            calculator.updateCanvasDimensions(1920, 540);
            expect(calculator.uniformScale).toBe(0.5);
            expect(calculator.scaleFontSize(60)).toBe(30);
        });
    });
    
    describe('境界検証', () => {
        test('validateElementBoundsが境界内の要素に対してtrueを返す', () => {
            expect(calculator.validateElementBounds(0, 0, 100, 100)).toBe(true: any);
            expect(calculator.validateElementBounds(500, 500, 100, 100)).toBe(true: any);
        });
        
        test('validateElementBoundsが境界外の要素に対してfalseを返す', () => {
            expect(calculator.validateElementBounds(-10, 0, 100, 100)).toBe(false: any);
            expect(calculator.validateElementBounds(0, -10, 100, 100)).toBe(false: any);
            expect(calculator.validateElementBounds(1900, 0, 100, 100)).toBe(false: any);
            expect(calculator.validateElementBounds(0, 1000, 100, 100)).toBe(false: any);
        });
    });
    
    describe('安全領域計算', () => {
        test('getSafeAreaがマージンを考慮した領域を返す', () => {
            const safeArea = calculator.getSafeArea(20);
            expect(safeArea.x).toBe(20);
            expect(safeArea.y).toBe(20);
            expect(safeArea.width).toBe(1880);
            expect(safeArea.height).toBe(1040);
        });
        
        test('スケーリングされたマージンを適用する', () => {
            calculator.updateCanvasDimensions(960, 540);
            const safeArea = calculator.getSafeArea(20);
            expect(safeArea.x).toBe(10);
            expect(safeArea.y).toBe(10);
            expect(safeArea.width).toBe(940);
            expect(safeArea.height).toBe(520);
        });
    });
    
    describe('垂直配置計算', () => {
        test('distributeVerticallyが要素を均等配置する', () => {
            const positions = calculator.distributeVertically(3, 60, 100, 400);
            
            expect(positions).toHaveLength(3);
            expect(positions[0].height).toBe(60);
            
            // 均等な間隔を確認
            const spacing1 = positions[1].y - (positions[0].y + positions[0].height);
            const spacing2 = positions[2].y - (positions[1].y + positions[1].height);
            expect(spacing1).toBeCloseTo(spacing2, 5);
        });
        
        test('スケーリングを考慮して配置する', () => {
            calculator.updateCanvasDimensions(960, 540);
            const positions = calculator.distributeVertically(2, 60, 50, 250);
            
            expect(positions[0].height).toBe(30); // 60 * 0.5
        });
    });
    
    describe('デバッグ情報', () => {
        test('getDebugInfoが正しい情報を返す', () => {
            calculator.updateCanvasDimensions(960, 540);
            const debug = calculator.getDebugInfo();
            
            expect(debug.canvasSize).toEqual({ width: 960, height: 540 });
            expect(debug.baseSize).toEqual({ width: 1920, height: 1080 });
            expect(debug.scale).toEqual({ x: 0.5, y: 0.5, uniform: 0.5 });
        });
    });
});