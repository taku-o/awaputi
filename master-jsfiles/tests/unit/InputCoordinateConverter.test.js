/**
 * InputCoordinateConverter のテスト
 * Issue #177 Canvas Scale UI Positioning 入力座標変換のテスト
 */

import { InputCoordinateConverter } from '../../src/utils/InputCoordinateConverter.js';

// ScaledCoordinateManager のモック
class MockScaledCoordinateManager {
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
    
    getCanvasInfo() {
        return this.mockCanvasInfo;
    }
    
    getScaleFactor() {
        return this.mockCanvasInfo.scale;
    }
}

// ResponsiveCanvasManager のモック
class MockResponsiveCanvasManager {
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
        
        this.canvas = {
            getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: 640,
                height: 480
            })
        };
    }
    
    screenToCanvas(x, y) {
        return {
            x: x / this.mockCanvasInfo.scale,
            y: y / this.mockCanvasInfo.scale
        };
    }
    
    getCanvasInfo() {
        return this.mockCanvasInfo;
    }
}

describe('InputCoordinateConverter', () => {
    let mockScaledCoordinateManager;
    let mockResponsiveCanvasManager;
    let inputCoordinateConverter;

    beforeEach(() => {
        mockScaledCoordinateManager = new MockScaledCoordinateManager();
        mockResponsiveCanvasManager = new MockResponsiveCanvasManager();
        inputCoordinateConverter = new InputCoordinateConverter(mockScaledCoordinateManager);
    });

    describe('constructor', () => {
        test('should initialize with required managers', () => {
            expect(inputCoordinateConverter.scaledCoordinateManager).toBe(mockScaledCoordinateManager);
            expect(inputCoordinateConverter.responsiveCanvasManager).toBe(mockResponsiveCanvasManager);
        });

        test('should work with null managers (fallback mode)', () => {
            const converter = new InputCoordinateConverter(null, null);
            expect(converter.scaledCoordinateManager).toBe(null);
            expect(converter.responsiveCanvasManager).toBe(null);
        });
    });

    describe('convertMouseEvent', () => {
        test('should convert mouse event coordinates', () => {
            const mockEvent = {
                clientX: 100,
                clientY: 50,
                type: 'click'
            };

            const result = inputCoordinateConverter.convertMouseEvent(mockEvent);
            
            expect(result.baseX).toBe(125); // 100 / 0.8
            expect(result.baseY).toBe(62.5); // 50 / 0.8
            expect(result.scaledX).toBe(100);
            expect(result.scaledY).toBe(50);
            expect(result.originalEvent).toBe(mockEvent);
        });

        test('should handle edge case coordinates', () => {
            const mockEvent = {
                clientX: 0,
                clientY: 0,
                type: 'click'
            };

            const result = inputCoordinateConverter.convertMouseEvent(mockEvent);
            
            expect(result.baseX).toBe(0);
            expect(result.baseY).toBe(0);
            expect(result.scaledX).toBe(0);
            expect(result.scaledY).toBe(0);
        });

        test('should fallback when ResponsiveCanvasManager is null', () => {
            const converter = new InputCoordinateConverter(mockScaledCoordinateManager, null);
            const mockEvent = { clientX: 100, clientY: 50, type: 'click' };

            const result = converter.convertMouseEvent(mockEvent);
            
            // フォールバック: スケール変換のみ
            expect(result.baseX).toBe(125);
            expect(result.baseY).toBe(62.5);
        });

        test('should handle ResponsiveCanvasManager errors gracefully', () => {
            mockResponsiveCanvasManager.screenToCanvas = () => {
                throw new Error('Conversion error');
            };

            const mockEvent = { clientX: 100, clientY: 50, type: 'click' };
            const result = inputCoordinateConverter.convertMouseEvent(mockEvent);
            
            // エラー時はフォールバック計算
            expect(result.baseX).toBe(125);
            expect(result.baseY).toBe(62.5);
        });
    });

    describe('convertTouchEvent', () => {
        test('should convert single touch event', () => {
            const mockTouchEvent = {
                touches: [{
                    clientX: 200,
                    clientY: 100,
                    identifier: 0
                }],
                type: 'touchstart'
            };

            const result = inputCoordinateConverter.convertTouchEvent(mockTouchEvent);
            
            expect(result).toHaveLength(1);
            expect(result[0].baseX).toBe(250); // 200 / 0.8
            expect(result[0].baseY).toBe(125); // 100 / 0.8
            expect(result[0].scaledX).toBe(200);
            expect(result[0].scaledY).toBe(100);
            expect(result[0].identifier).toBe(0);
            expect(result[0].originalEvent).toBe(mockTouchEvent);
        });

        test('should convert multi-touch event', () => {
            const mockTouchEvent = {
                touches: [
                    { clientX: 100, clientY: 50, identifier: 0 },
                    { clientX: 200, clientY: 150, identifier: 1 }
                ],
                type: 'touchstart'
            };

            const result = inputCoordinateConverter.convertTouchEvent(mockTouchEvent);
            
            expect(result).toHaveLength(2);
            expect(result[0].identifier).toBe(0);
            expect(result[1].identifier).toBe(1);
            expect(result[0].baseX).toBe(125);
            expect(result[1].baseX).toBe(250);
        });

        test('should handle empty touches array', () => {
            const mockTouchEvent = {
                touches: [],
                type: 'touchstart'
            };

            const result = inputCoordinateConverter.convertTouchEvent(mockTouchEvent);
            expect(result).toEqual([]);
        });

        test('should handle invalid touch objects', () => {
            const mockTouchEvent = {
                touches: [
                    { clientX: NaN, clientY: 50, identifier: 0 },
                    { clientX: 100, clientY: NaN, identifier: 1 },
                    null,
                    { clientX: 200, clientY: 100, identifier: 2 }
                ],
                type: 'touchstart'
            };

            const result = inputCoordinateConverter.convertTouchEvent(mockTouchEvent);
            
            // 有効なタッチのみが返される
            expect(result).toHaveLength(1);
            expect(result[0].identifier).toBe(2);
        });
    });

    describe('isPointInScaledRect', () => {
        test('should detect point inside rectangle', () => {
            const rect = { x: 50, y: 50, width: 100, height: 80 };
            const point = { x: 100, y: 90 };

            const result = inputCoordinateConverter.isPointInScaledRect(point, rect);
            expect(result).toBe(true);
        });

        test('should detect point outside rectangle', () => {
            const rect = { x: 50, y: 50, width: 100, height: 80 };
            const point = { x: 200, y: 90 };

            const result = inputCoordinateConverter.isPointInScaledRect(point, rect);
            expect(result).toBe(false);
        });

        test('should handle edge cases', () => {
            const rect = { x: 50, y: 50, width: 100, height: 80 };
            
            // 境界上の点
            expect(inputCoordinateConverter.isPointInScaledRect({ x: 50, y: 50 }, rect)).toBe(true);
            expect(inputCoordinateConverter.isPointInScaledRect({ x: 150, y: 130 }, rect)).toBe(true);
            
            // 境界外の点
            expect(inputCoordinateConverter.isPointInScaledRect({ x: 49, y: 50 }, rect)).toBe(false);
            expect(inputCoordinateConverter.isPointInScaledRect({ x: 151, y: 130 }, rect)).toBe(false);
        });

        test('should handle zero-size rectangle', () => {
            const rect = { x: 50, y: 50, width: 0, height: 0 };
            const point = { x: 50, y: 50 };

            const result = inputCoordinateConverter.isPointInScaledRect(point, rect);
            expect(result).toBe(true);
        });
    });

    describe('isPointInScaledCircle', () => {
        test('should detect point inside circle', () => {
            const circle = { x: 100, y: 100, radius: 50 };
            const point = { x: 120, y: 120 };

            const result = inputCoordinateConverter.isPointInScaledCircle(point, circle);
            expect(result).toBe(true);
        });

        test('should detect point outside circle', () => {
            const circle = { x: 100, y: 100, radius: 50 };
            const point = { x: 200, y: 200 };

            const result = inputCoordinateConverter.isPointInScaledCircle(point, circle);
            expect(result).toBe(false);
        });

        test('should handle point on circle boundary', () => {
            const circle = { x: 100, y: 100, radius: 50 };
            const point = { x: 150, y: 100 }; // Exactly on boundary

            const result = inputCoordinateConverter.isPointInScaledCircle(point, circle);
            expect(result).toBe(true);
        });

        test('should handle center point', () => {
            const circle = { x: 100, y: 100, radius: 50 };
            const point = { x: 100, y: 100 };

            const result = inputCoordinateConverter.isPointInScaledCircle(point, circle);
            expect(result).toBe(true);
        });

        test('should handle zero radius circle', () => {
            const circle = { x: 100, y: 100, radius: 0 };
            const point = { x: 100, y: 100 };

            const result = inputCoordinateConverter.isPointInScaledCircle(point, circle);
            expect(result).toBe(true);
        });
    });

    describe('validateCoordinates', () => {
        test('should validate correct coordinates', () => {
            expect(inputCoordinateConverter.validateCoordinates(10, 20)).toBe(true);
            expect(inputCoordinateConverter.validateCoordinates(0, 0)).toBe(true);
            expect(inputCoordinateConverter.validateCoordinates(-5, -10)).toBe(true);
            expect(inputCoordinateConverter.validateCoordinates(100.5, 200.7)).toBe(true);
        });

        test('should reject invalid coordinates', () => {
            expect(inputCoordinateConverter.validateCoordinates('10', 20)).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(10, '20')).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(NaN, 20)).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(10, NaN)).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(Infinity, 20)).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(10, -Infinity)).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(null, 20)).toBe(false);
            expect(inputCoordinateConverter.validateCoordinates(10, undefined)).toBe(false);
        });
    });

    describe('isWithinCanvasBounds', () => {
        test('should detect point within canvas bounds', () => {
            const point = { x: 400, y: 300 };
            const result = inputCoordinateConverter.isWithinCanvasBounds(point);
            expect(result).toBe(true);
        });

        test('should detect point outside canvas bounds', () => {
            const point = { x: 900, y: 300 };
            const result = inputCoordinateConverter.isWithinCanvasBounds(point);
            expect(result).toBe(false);
        });

        test('should handle boundary points', () => {
            expect(inputCoordinateConverter.isWithinCanvasBounds({ x: 0, y: 0 })).toBe(true);
            expect(inputCoordinateConverter.isWithinCanvasBounds({ x: 800, y: 600 })).toBe(true);
            expect(inputCoordinateConverter.isWithinCanvasBounds({ x: -1, y: 0 })).toBe(false);
            expect(inputCoordinateConverter.isWithinCanvasBounds({ x: 801, y: 600 })).toBe(false);
        });
    });

    describe('integration scenarios', () => {
        test('should handle complete input processing workflow', () => {
            const mockMouseEvent = {
                clientX: 160,
                clientY: 120,
                type: 'click'
            };

            // マウスイベント変換
            const converted = inputCoordinateConverter.convertMouseEvent(mockMouseEvent);
            
            // 座標検証
            expect(inputCoordinateConverter.validateCoordinates(converted.baseX, converted.baseY)).toBe(true);
            
            // Canvas境界内チェック
            expect(inputCoordinateConverter.isWithinCanvasBounds({ x: converted.baseX, y: converted.baseY })).toBe(true);
            
            // 矩形内チェック
            const rect = { x: 150, y: 100, width: 100, height: 80 };
            expect(inputCoordinateConverter.isPointInScaledRect({ x: converted.baseX, y: converted.baseY }, rect)).toBe(true);
        });

        test('should handle multi-touch interaction', () => {
            const mockTouchEvent = {
                touches: [
                    { clientX: 80, clientY: 40, identifier: 0 },
                    { clientX: 240, clientY: 160, identifier: 1 }
                ],
                type: 'touchstart'
            };

            const converted = inputCoordinateConverter.convertTouchEvent(mockTouchEvent);
            expect(converted).toHaveLength(2);

            // すべてのタッチポイントが有効な座標を持つことを確認
            converted.forEach((touch, index) => {
                expect(inputCoordinateConverter.validateCoordinates(touch.baseX, touch.baseY)).toBe(true);
                expect(inputCoordinateConverter.isWithinCanvasBounds({ x: touch.baseX, y: touch.baseY })).toBe(true);
                expect(touch.identifier).toBe(index);
            });
        });

        test('should maintain accuracy in coordinate transformations', () => {
            const testCases = [
                { x: 0, y: 0 },
                { x: 320, y: 240 }, // Center
                { x: 640, y: 480 }, // Max scaled
                { x: 123.456, y: 789.012 } // Decimal precision
            ];

            testCases.forEach(testCase => {
                const mockEvent = {
                    clientX: testCase.x,
                    clientY: testCase.y,
                    type: 'click'
                };

                const converted = inputCoordinateConverter.convertMouseEvent(mockEvent);
                
                // 逆変換で元の値に戻ることを確認
                const backToScaled = {
                    x: converted.baseX * 0.8,
                    y: converted.baseY * 0.8
                };
                
                expect(Math.abs(backToScaled.x - testCase.x)).toBeLessThan(0.001);
                expect(Math.abs(backToScaled.y - testCase.y)).toBeLessThan(0.001);
            });
        });
    });
});