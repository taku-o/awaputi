/**
 * InputCoordinateConverter のテスト
 * Issue #177 Canvas Scale UI Positioning 入力座標変換のテスト
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { InputCoordinateConverter } from '../../src/utils/InputCoordinateConverter.js';

// 型定義
interface CanvasInfo {
    scaleFactor: number;
    scale: number;
    displayWidth: number;
    displayHeight: number;
    actualWidth: number;
    actualHeight: number;
    pixelRatio: number;
    baseWidth: number;
    baseHeight: number;
}

interface Coordinates { x: number; y: number; }



interface ConvertedMouseEvent {
    baseX: number;
    baseY: number;
    scaledX: number;
    scaledY: number;
    originalX: number;
    originalY: number;
    canvasRelativeX: number;
    canvasRelativeY: number;
}

interface MockResponsiveCanvasManager {
    getCanvasInfo: jest.Mock<() => CanvasInfo>;
    getScaleFactor: jest.Mock<() => number>;
    getPixelRatio: jest.Mock<() => number>;
    getDisplayDimensions: jest.Mock<() => { width: number; height: number }>;
    getBaseDimensions: jest.Mock<() => { width: number; height: number }>;
}

describe('InputCoordinateConverter', () => {
    let converter: InputCoordinateConverter;
    let mockCanvas: HTMLCanvasElement;
    let mockCanvasManager: MockResponsiveCanvasManager;

    beforeEach(() => {
        // Mock canvas element
        mockCanvas = {
            getBoundingClientRect: jest.fn().mockReturnValue({
                left: 100,
                top: 50,
                width: 800,
                height: 600
            }),
            width: 1600,
            height: 1200,
            clientWidth: 800,
            clientHeight: 600
        } as any;

        // Mock ResponsiveCanvasManager
        mockCanvasManager = {
            getCanvasInfo: jest.fn().mockReturnValue({
                scaleFactor: 1.5,
                scale: 1.5,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 1600,
                actualHeight: 1200,
                pixelRatio: 2,
                baseWidth: 1024,
                baseHeight: 768
            }),
            getScaleFactor: jest.fn().mockReturnValue(1.5),
            getPixelRatio: jest.fn().mockReturnValue(2),
            getDisplayDimensions: jest.fn().mockReturnValue({ width: 800, height: 600 }),
            getBaseDimensions: jest.fn().mockReturnValue({ width: 1024, height: 768 })
        };

        converter = new InputCoordinateConverter(mockCanvas, mockCanvasManager as any);
    });

    describe('初期化', () => {
        test('正しくインスタンスが作成される', () => {
            expect(converter).toBeInstanceOf(InputCoordinateConverter);
            expect(converter.canvas).toBe(mockCanvas);
            expect(converter.canvasManager).toBe(mockCanvasManager);
        });
        
        test('canvas要素とcanvasManagerが設定される', () => {
            expect(converter.canvas).toBeDefined();
            expect(converter.canvasManager).toBeDefined();
        });
    });

    describe('マウス座標変換', () => {
        test('基本的なマウスイベント座標変換', () => {
            const mouseEvent = {
                clientX: 500,
                clientY: 350
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            expect(converted).toHaveProperty('baseX');
            expect(converted).toHaveProperty('baseY');
            expect(converted).toHaveProperty('scaledX');
            expect(converted).toHaveProperty('scaledY');
            expect(converted).toHaveProperty('originalX', 500);
            expect(converted).toHaveProperty('originalY', 350)
        });

        test('キャンバス境界内の座標変換', () => {
            const mouseEvent = {
                clientX: 300, // canvas left (100) + offset (200)
                clientY: 200  // canvas top (50) + offset (150)
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            expect(converted.canvasRelativeX).toBe(200);
            expect(converted.canvasRelativeY).toBe(150);
        });

        test('キャンバス境界外の座標変換', () => {
            const mouseEvent = {
                clientX: 50,  // canvas leftより左
                clientY: 25   // canvas topより上
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            expect(converted.canvasRelativeX).toBe(-50);
            expect(converted.canvasRelativeY).toBe(-25);
        });

        test('スケール適用済み座標の計算', () => {
            const mouseEvent = {
                clientX: 500,
                clientY: 350
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            // スケール係数(1.5)で調整された座標
            expect(converted.scaledX).toBe((500 - 100) / 1.5);
            expect(converted.scaledY).toBe((350 - 50) / 1.5)
        })
    });

    describe('タッチ座標変換', () => {
        test('単一タッチイベントの座標変換', () => {
            const touchEvent = {
                touches: [{
                    clientX: 400,
                    clientY: 300
                }]
            } as TouchEvent;

            const converted = converter.convertTouchCoordinates(touchEvent);

            expect(converted).toHaveLength(1);
            expect(converted[0]).toHaveProperty('baseX');
            expect(converted[0]).toHaveProperty('baseY');
            expect(converted[0]).toHaveProperty('scaledX');
            expect(converted[0]).toHaveProperty('scaledY')
        });

        test('マルチタッチイベントの座標変換', () => {
            const touchEvent = {
                touches: [
                    { clientX: 300, clientY: 200 },
                    { clientX: 500, clientY: 400 }
                ]
            } as TouchEvent;

            const converted = converter.convertTouchCoordinates(touchEvent);

            expect(converted).toHaveLength(2);
            expect(converted[0]).toHaveProperty('originalX', 300);
            expect(converted[0]).toHaveProperty('originalY', 200);
            expect(converted[1]).toHaveProperty('originalX', 500);
            expect(converted[1]).toHaveProperty('originalY', 400)
        });

        test('タッチなしのイベント', () => {
            const touchEvent = {
                touches: []
            } as TouchEvent;

            const converted = converter.convertTouchCoordinates(touchEvent);
            expect(converted).toHaveLength(0);
        })
    });

    describe('座標境界チェック', () => {
        test('キャンバス内の座標判定', () => {
            const insideCoords: Coordinates = { x: 400, y: 300 };
            expect(converter.isInsideCanvas(insideCoords)).toBe(true);
        });

        test('キャンバス外の座標判定 - 左上', () => {
            const outsideCoords: Coordinates = { x: -10, y: -5 };
            expect(converter.isInsideCanvas(outsideCoords)).toBe(false);
        });

        test('キャンバス外の座標判定 - 右下', () => {
            const outsideCoords: Coordinates = { x: 850, y: 650 };
            expect(converter.isInsideCanvas(outsideCoords)).toBe(false);
        });

        test('キャンバス境界線上の座標判定', () => {
            const boundaryCoords: Coordinates = { x: 800, y: 600 };
            expect(converter.isInsideCanvas(boundaryCoords)).toBe(false);
        })
    });

    describe('座標正規化', () => {
        test('正規化座標(0-1)の計算', () => {
            const coords: Coordinates = { x: 400, y: 300 };
            const normalized = converter.normalizeCoordinates(coords);

            expect(normalized.x).toBe(0.5); // 400/800
            expect(normalized.y).toBe(0.5); // 300/600
        });

        test('範囲外座標の正規化', () => {
            const coords: Coordinates = { x: -100, y: 700 };
            const normalized = converter.normalizeCoordinates(coords);

            expect(normalized.x).toBeLessThan(0);
            expect(normalized.y).toBeGreaterThan(1);
        });

        test('ゼロ座標の正規化', () => {
            const coords: Coordinates = { x: 0, y: 0 };
            const normalized = converter.normalizeCoordinates(coords);

            expect(normalized.x).toBe(0);
            expect(normalized.y).toBe(0);
        })
    });

    describe('逆座標変換', () => {
        test('正規化座標から実座標への変換', () => {
            const normalized: Coordinates = { x: 0.25, y: 0.75 };
            const actual = converter.denormalizeCoordinates(normalized);

            expect(actual.x).toBe(200); // 0.25 * 800
            expect(actual.y).toBe(450); // 0.75 * 600
        });

        test('スケール座標からベース座標への変換', () => {
            const scaled: Coordinates = { x: 200, y: 150 };
            const base = converter.convertToBaseCoordinates(scaled);

            expect(base.x).toBe(200 * 1.5); // スケール係数適用
            expect(base.y).toBe(150 * 1.5);
        })
    });

    describe('異なるスケール係数での変換', () => {

        beforeEach(() => {
            mockCanvasManager.getScaleFactor.mockReturnValue(0.8);
            mockCanvasManager.getCanvasInfo.mockReturnValue({
                scaleFactor: 0.8,
                scale: 0.8,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 800,
                actualHeight: 600,
                pixelRatio: 1,
                baseWidth: 800,
                baseHeight: 600
            });
        });

        test('小さいスケール係数での変換', () => {
            const mouseEvent = {
                clientX: 500,
                clientY: 350
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            expect(converted.scaledX).toBe((500 - 100) / 0.8);
            expect(converted.scaledY).toBe((350 - 50) / 0.8)
        })
    });

    describe('高DPIディスプレイ対応', () => {
        beforeEach(() => {
            mockCanvasManager.getPixelRatio.mockReturnValue(3)
        });

        test('高ピクセル比での座標変換', () => {
            const mouseEvent = {
                clientX: 300,
                clientY: 200
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            // ピクセル比が考慮された変換
            expect(converted).toHaveProperty('baseX');
            expect(converted).toHaveProperty('baseY')
        })
    });

    describe('動的なキャンバス情報更新', () => {
        test('キャンバス情報更新の反映', () => {
            const newCanvasInfo: CanvasInfo = {
                scaleFactor: 2.0,
                scale: 2.0,
                displayWidth: 1000,
                displayHeight: 750,
                actualWidth: 2000,
                actualHeight: 1500,
                pixelRatio: 1,
                baseWidth: 1024,
                baseHeight: 768
            };

            mockCanvasManager.getCanvasInfo.mockReturnValue(newCanvasInfo);
            mockCanvasManager.getScaleFactor.mockReturnValue(2.0);

            const mouseEvent = {
                clientX: 600,
                clientY: 400
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            expect(converted.scaledX).toBe((600 - 100) / 2.0);
            expect(converted.scaledY).toBe((400 - 50) / 2.0)
        })
    });

    describe('エラーハンドリング', () => {
        test('nullのマウスイベントでもエラーが発生しない', () => {
            expect(() => {
                converter.convertMouseCoordinates(null as any)
            }).not.toThrow()
        });

        test('不正なタッチイベントでもエラーが発生しない', () => {
            expect(() => {
                converter.convertTouchCoordinates(null as any)
            }).not.toThrow()
        });

        test('キャンバス情報取得エラー時の処理', () => {
            mockCanvasManager.getCanvasInfo.mockImplementation(() => {
                throw new Error('Canvas info error')
            });

            expect(() => {
                const coords: Coordinates = { x: 100, y: 100 };
                converter.normalizeCoordinates(coords)
            }).not.toThrow()
        });

        test('不正な座標値での処理', () => {
            const invalidCoords: Coordinates = { x: NaN, y: Infinity };
            
            expect(() => {
                converter.normalizeCoordinates(invalidCoords)
            }).not.toThrow();

            expect(() => {
                converter.isInsideCanvas(invalidCoords)
            }).not.toThrow()
        })
    });

    describe('パフォーマンステスト', () => {
        test('大量の座標変換処理の性能', () => {
            const startTime = performance.now();
            
            for (let i = 0; i < 1000; i++) {
                const mouseEvent = {
                    clientX: Math.random() * 800 + 100,
                    clientY: Math.random() * 600 + 50
                } as MouseEvent;
                
                converter.convertMouseCoordinates(mouseEvent)
            }
            
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(100); // 100ms以内
        })
    });

    describe('設定変更対応', () => {
        test('キャンバスサイズ変更への対応', () => {
            // キャンバスサイズ変更
            (mockCanvas.getBoundingClientRect as jest.Mock).mockReturnValue({
                left: 50,
                top: 25,
                width: 1200,
                height: 900
            });

            const mouseEvent = {
                clientX: 650,
                clientY: 475
            } as MouseEvent;

            const converted = converter.convertMouseCoordinates(mouseEvent);

            expect(converted.canvasRelativeX).toBe(600); // 650 - 50
            expect(converted.canvasRelativeY).toBe(450); // 475 - 25
        });
    });
});