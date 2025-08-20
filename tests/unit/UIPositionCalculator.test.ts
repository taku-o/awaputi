/**
 * UIPositionCalculator のテスト
 * Issue #177 Canvas Scale UI Positioning UI要素位置計算のテスト
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { UIPositionCalculator } from '../../src/utils/UIPositionCalculator.js';
// Canvas情報の型定義
interface CanvasInfo {
    scaleFactor: number,
    scale: number,
    displayWidth: number,
    displayHeight: number,
    actualWidth: number,
    actualHeight: number,
    pixelRatio: number,
    baseWidth: number,
    baseHeight: number,
}
// 位置情報の型定義
interface Position {
    x: number,
    y: number,
    alignment: string,
}
// サイズ情報の型定義
interface Size {
    width: number,
    height: number,
}
// マージン情報の型定義
interface Margins {
    top: number,
    left: number,
    right: number,
    bottom: number,
}
// UI要素の型定義
interface UIElement {
    id: string,
    width: number,
    height: number,
}
// レイアウト要素の型定義
interface LayoutElement extends UIElement {
    x: number,
    y: number,
}
// ScaledCoordinateManager のモック
class MockScaledCoordinateManager {
    mockCanvasInfo: CanvasInfo,
    constructor() {
        this.mockCanvasInfo = {
            scaleFactor: 0.8,
            scale: 0.8,
            displayWidth: 640,
            displayHeight: 480,
            actualWidth: 640,
            actualHeight: 480,
            pixelRatio: 1,
            baseWidth: 800,
            baseHeight: 600
        };
    }
    
    getCanvasInfo(): CanvasInfo {
        return this.mockCanvasInfo;
    }
    
    getScaleFactor('): number {
        return this.mockCanvasInfo.scale;
    }
}
describe('UIPositionCalculator', () => {
    let mockScaledCoordinateManager: MockScaledCoordinateManager,
    let uiPositionCalculator: UIPositionCalculator,
    beforeEach(() => {
        mockScaledCoordinateManager = new MockScaledCoordinateManager();
        uiPositionCalculator = new UIPositionCalculator(mockScaledCoordinateManager);
    }');
    describe('constructor', (') => {
        test('should initialize with ScaledCoordinateManager', () => {
            expect(uiPositionCalculator.scaledCoordinateManager).toBe(mockScaledCoordinateManager);
        }');
        test('should initialize device type detection', () => {
            const deviceType = uiPositionCalculator.getDeviceType(');
            expect(['desktop', 'tablet', 'mobile']).toContain(deviceType);
        }');
    }
    describe('getStatusPosition', (') => {
        test('should return top-left position for score', (') => {
            const position = uiPositionCalculator.getStatusPosition('score');
            expect(position.x).toBeGreaterThanOrEqual(0);
            expect(position.y).toBeGreaterThanOrEqual(0);
            expect(position.alignment').toBe('left');
        }');
        test('should return appropriate position for HP', (') => {
            const position = uiPositionCalculator.getStatusPosition('hp');
            expect(position.x).toBeGreaterThanOrEqual(0);
            expect(position.y).toBeGreaterThan(20); // Below score
            expect(position.alignment').toBe('left');
        }');
        test('should return appropriate position for time', (') => {
            const position = uiPositionCalculator.getStatusPosition('time');
            expect(position.x).toBeGreaterThanOrEqual(0);
            expect(position.y).toBeGreaterThan(40); // Below HP
            expect(position.alignment').toBe('left');
        }');
        test('should return right-aligned position for combo', (') => {
            const position = uiPositionCalculator.getStatusPosition('combo');
            expect(position.alignment').toBe('right');
            expect(position.x).toBeGreaterThan(0);
            expect(position.y).toBeGreaterThanOrEqual(0);
        }');
        test('should return default position for unknown type', (') => {
            const position = uiPositionCalculator.getStatusPosition('unknown');
            expect(position.x).toBe(20);
            expect(position.y).toBe(20);
            expect(position.alignment').toBe('left');
        }');
    }
    describe('getButtonPosition', (') => {
        test('should return top-right position for control buttons', (') => {
            const position = uiPositionCalculator.getButtonPosition('control');
            expect(position.x).toBeGreaterThan(0);
            expect(position.y).toBeGreaterThanOrEqual(0);
            expect(position.alignment').toBe('right');
        }');
        test('should return centered position for menu buttons', (') => {
            const position = uiPositionCalculator.getButtonPosition('menu');
            expect(position.alignment').toBe('center');
            expect(position.x).toBeGreaterThan(0);
            expect(position.y).toBeGreaterThan(0);
        }');
        test('should return default position for unknown button type', (') => {
            const position = uiPositionCalculator.getButtonPosition('unknown');
            expect(position.x).toBe(20);
            expect(position.y).toBe(20);
            expect(position.alignment').toBe('left');
        }');
    }
    describe('getDialogPosition', (') => {
        test('should return centered position for dialogs', () => {
            const size: Size = { width: 200, height: 100 };
            const position = uiPositionCalculator.getDialogPosition(size);
            const canvasInfo = mockScaledCoordinateManager.getCanvasInfo();
            const expectedX = (canvasInfo.baseWidth - size.width) / 2;
            const expectedY = (canvasInfo.baseHeight - size.height) / 2;
            
            expect(position.x).toBe(expectedX);
            expect(position.y).toBe(expectedY);
            expect(position.alignment').toBe('center');
        }');
        test('should handle edge cases with zero size', () => {
            const size: Size = { width: 0, height: 0 };
            const position = uiPositionCalculator.getDialogPosition(size);
            const canvasInfo = mockScaledCoordinateManager.getCanvasInfo();
            const expectedX = canvasInfo.baseWidth / 2;
            const expectedY = canvasInfo.baseHeight / 2;
            
            expect(position.x).toBe(expectedX);
            expect(position.y).toBe(expectedY);
        }');
    }
    describe('getResponsiveMargins', (') => {
        test('should return appropriate margins for desktop', (') => {
            // デスクトップの場合のマージンをテスト
            Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true }');
            Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
            const margins = uiPositionCalculator.getResponsiveMargins();
            expect(margins.top).toBe(20);
            expect(margins.left).toBe(20);
            expect(margins.right).toBe(20);
            expect(margins.bottom).toBe(20);
        }');
        test('should return smaller margins for mobile', (') => {
            // モバイルの場合のマージンをテスト
            Object.defineProperty(window, 'innerWidth', { value: 400, writable: true }');
            Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
            const calculator = new UIPositionCalculator(mockScaledCoordinateManager);
            const margins = calculator.getResponsiveMargins();
            expect(margins.top).toBe(10);
            expect(margins.left).toBe(10);
            expect(margins.right).toBe(10);
            expect(margins.bottom).toBe(10);
        }');
    }
    describe('calculateLayout', (') => {
        test('should calculate layout for multiple elements', (') => {
            const elements: UIElement[] = [
                { id: 'score', width: 100, height: 30 },
                { id: 'hp', width: 100, height: 30 }
            ];
            
            const layout = uiPositionCalculator.calculateLayout(elements);
            expect(layout).toHaveLength(2);
            expect(layout[0].id').toBe('score');
            expect(layout[1].id').toBe('hp');
            expect(layout[1].y).toBeGreaterThan(layout[0].y); // HP should be below score
        }');
        test('should handle empty elements array', () => {
            const layout = uiPositionCalculator.calculateLayout([]);
            expect(layout).toEqual([]);
        }');
        test('should include margins in layout calculations', (') => {
            const elements: UIElement[] = [{ id: 'test', width: 50, height: 25 }];
            const layout = uiPositionCalculator.calculateLayout(elements);
            expect(layout[0].x).toBeGreaterThan(0); // Should have left margin
            expect(layout[0].y).toBeGreaterThan(0); // Should have top margin
        }');
    }
    describe('alignToEdge', (') => {
        const elementSize: Size = { width: 100, height: 50 };
        test('should align to top-left', (') => {
            const position = uiPositionCalculator.alignToEdge(elementSize, 'top-left');
            const margins = uiPositionCalculator.getResponsiveMargins();
            expect(position.x).toBe(margins.left);
            expect(position.y).toBe(margins.top);
        }');
        test('should align to top-right', (') => {
            const position = uiPositionCalculator.alignToEdge(elementSize, 'top-right');
            const margins = uiPositionCalculator.getResponsiveMargins();
            const canvasInfo = mockScaledCoordinateManager.getCanvasInfo();
            expect(position.x).toBe(canvasInfo.baseWidth - elementSize.width - margins.right);
            expect(position.y).toBe(margins.top);
        }');
        test('should align to center', (') => {
            const position = uiPositionCalculator.alignToEdge(elementSize, 'center');
            const canvasInfo = mockScaledCoordinateManager.getCanvasInfo();
            const expectedX = (canvasInfo.baseWidth - elementSize.width) / 2;
            const expectedY = (canvasInfo.baseHeight - elementSize.height) / 2;
            
            expect(position.x).toBe(expectedX);
            expect(position.y).toBe(expectedY);
        }');
        test('should handle invalid alignment', (') => {
            const position = uiPositionCalculator.alignToEdge(elementSize, 'invalid');
            expect(position.x).toBe(0);
            expect(position.y).toBe(0);
        }');
    }
    describe('centerElement', (') => {
        test('should center element in canvas', () => {
            const elementSize: Size = { width: 200, height: 100 };
            const position = uiPositionCalculator.centerElement(elementSize);
            const canvasInfo = mockScaledCoordinateManager.getCanvasInfo();
            const expectedX = (canvasInfo.baseWidth - elementSize.width) / 2;
            const expectedY = (canvasInfo.baseHeight - elementSize.height) / 2;
            
            expect(position.x).toBe(expectedX);
            expect(position.y).toBe(expectedY);
        }');
        test('should handle zero-size element', () => {
            const elementSize: Size = { width: 0, height: 0 };
            const position = uiPositionCalculator.centerElement(elementSize);
            const canvasInfo = mockScaledCoordinateManager.getCanvasInfo();
            const expectedX = canvasInfo.baseWidth / 2;
            const expectedY = canvasInfo.baseHeight / 2;
            
            expect(position.x).toBe(expectedX);
            expect(position.y).toBe(expectedY);
        }');
    }
    describe('getDeviceType', (') => {
        test('should detect desktop', (') => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true }');
            Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
            const calculator = new UIPositionCalculator(mockScaledCoordinateManager);
            expect(calculator.getDeviceType()').toBe('desktop');
        }');
        test('should detect tablet', (') => {
            Object.defineProperty(window, 'innerWidth', { value: 800, writable: true }');
            Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
            const calculator = new UIPositionCalculator(mockScaledCoordinateManager);
            expect(calculator.getDeviceType()').toBe('tablet');
        }');
        test('should detect mobile', (') => {
            Object.defineProperty(window, 'innerWidth', { value: 400, writable: true }');
            Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
            const calculator = new UIPositionCalculator(mockScaledCoordinateManager);
            expect(calculator.getDeviceType()').toBe('mobile');
        }');
    }
    describe('integration scenarios', (') => {
        test('should provide consistent positioning across different device types', (') => {
            const testCases = [
                { width: 1200, height: 800, expected: 'desktop' },
                { width: 800, height: 600, expected: 'tablet' },
                { width: 400, height: 600, expected: 'mobile' }
            ];
            testCases.forEach(testCase => {');
                Object.defineProperty(window, 'innerWidth', { value: testCase.width, writable: true )'),
                Object.defineProperty(window, 'innerHeight', { value: testCase.height, writable: true });
                const calculator = new UIPositionCalculator(mockScaledCoordinateManager);
                expect(calculator.getDeviceType().toBe(testCase.expected');
                // すべてのデバイスタイプで基本的な位置計算が機能することを確認
                const scorePos = calculator.getStatusPosition('score');
                expect(scorePos.x).toBeGreaterThanOrEqual(0);
                expect(scorePos.y).toBeGreaterThanOrEqual(0);
            }');
        }
        test('should handle dynamic canvas size changes', () => {
            const originalCanvasInfo = mockScaledCoordinateManager.mockCanvasInfo;
            
            // Canvas サイズを変更
            mockScaledCoordinateManager.mockCanvasInfo = {
                ...originalCanvasInfo,
                baseWidth: 1000,
                baseHeight: 750
            };
            
            const position = uiPositionCalculator.getDialogPosition({ width: 200, height: 100 ),
            expect(position.x).toBe(400); // (1000 - 200) / 2
            expect(position.y).toBe(325); // (750 - 100) / 2
            
            // 元に戻す
            mockScaledCoordinateManager.mockCanvasInfo = originalCanvasInfo;
        });
    }
}');