/**
 * ScaledCoordinateManager のテスト
 * Issue #177 Canvas Scale UI Positioning 座標変換システムのテスト
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { ScaledCoordinateManager } from '../../src/utils/ScaledCoordinateManager.js';

// Canvas情報の型定義
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

// 座標の型定義
interface Coordinates {
    x: number;
    y: number;
}

// サイズの型定義
interface Size {
    width: number;
    height: number;
}

// ResponsiveCanvasManager のモック
class MockResponsiveCanvasManager {
    mockCanvasInfo: CanvasInfo;

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
    
    getScaledCoordinates(x: number, y: number): Coordinates {
        return {
            x: x * this.mockCanvasInfo.scale,
            y: y * this.mockCanvasInfo.scale
        };
    }
    
    getScaledSize(width: number, height: number): Size {
        return {
            width: width * this.mockCanvasInfo.scale,
            height: height * this.mockCanvasInfo.scale
        };
    }
    
    getCanvasInfo(): CanvasInfo {
        return this.mockCanvasInfo;
    }
}

describe('ScaledCoordinateManager', () => {
    let mockResponsiveCanvasManager: MockResponsiveCanvasManager;
    let scaledCoordinateManager: ScaledCoordinateManager;

    beforeEach(() => {
        mockResponsiveCanvasManager = new MockResponsiveCanvasManager();
        scaledCoordinateManager = new ScaledCoordinateManager(mockResponsiveCanvasManager);
    });

    afterEach(() => {
        scaledCoordinateManager.cleanup();
    });

    describe('constructor', () => {
        test('should initialize with ResponsiveCanvasManager', () => {
            expect(scaledCoordinateManager.responsiveCanvasManager).toBe(mockResponsiveCanvasManager);
            expect(scaledCoordinateManager.baseWidth).toBe(800);
            expect(scaledCoordinateManager.baseHeight).toBe(600);
            expect(scaledCoordinateManager.scaleChangeCallbacks).toEqual([]);
        });

        test('should work without ResponsiveCanvasManager (fallback)', () => {
            const manager = new ScaledCoordinateManager(null);
            expect(manager.responsiveCanvasManager).toBe(null);
            expect(manager.baseWidth).toBe(800);
            expect(manager.baseHeight).toBe(600);
            manager.cleanup();
        });
    });

    describe('getScaledPosition', () => {
        test('should convert base coordinates to scaled coordinates', () => {
            const result = scaledCoordinateManager.getScaledPosition(100, 50);
            expect(result).toEqual({ x: 80, y: 40 });
        });

        test('should handle zero coordinates', () => {
            const result = scaledCoordinateManager.getScaledPosition(0, 0);
            expect(result).toEqual({ x: 0, y: 0 });
        });

        test('should handle negative coordinates', () => {
            const result = scaledCoordinateManager.getScaledPosition(-10, -20);
            expect(result).toEqual({ x: -8, y: -16 });
        });

        test('should fallback when ResponsiveCanvasManager fails', () => {
            mockResponsiveCanvasManager.getScaledCoordinates = () => {
                throw new Error('Mock error');
            };
            
            const result = scaledCoordinateManager.getScaledPosition(100, 50);
            expect(result).toEqual({ x: 80, y: 40 }); // Fallback calculation
        });

        test('should fallback when ResponsiveCanvasManager is null', () => {
            const manager = new ScaledCoordinateManager(null);
            const result = manager.getScaledPosition(100, 50);
            expect(result).toEqual({ x: 100, y: 50 }); // Scale factor 1.0
            manager.cleanup();
        });
    });

    describe('getScaledSize', () => {
        test('should convert base size to scaled size', () => {
            const result = scaledCoordinateManager.getScaledSize(200, 100);
            expect(result).toEqual({ width: 160, height: 80 });
        });

        test('should handle zero size', () => {
            const result = scaledCoordinateManager.getScaledSize(0, 0);
            expect(result).toEqual({ width: 0, height: 0 });
        });

        test('should fallback when ResponsiveCanvasManager fails', () => {
            mockResponsiveCanvasManager.getScaledSize = () => {
                throw new Error('Mock error');
            };
            
            const result = scaledCoordinateManager.getScaledSize(200, 100);
            expect(result).toEqual({ width: 160, height: 80 }); // Fallback calculation
        });
    });

    describe('getBasePosition', () => {
        test('should convert scaled coordinates back to base coordinates', () => {
            const result = scaledCoordinateManager.getBasePosition(80, 40);
            expect(result).toEqual({ x: 100, y: 50 });
        });

        test('should handle zero coordinates', () => {
            const result = scaledCoordinateManager.getBasePosition(0, 0);
            expect(result).toEqual({ x: 0, y: 0 });
        });

        test('should handle zero scale factor gracefully', () => {
            mockResponsiveCanvasManager.mockCanvasInfo.scale = 0;
            mockResponsiveCanvasManager.mockCanvasInfo.scaleFactor = 0;
            
            const result = scaledCoordinateManager.getBasePosition(100, 50);
            expect(result).toEqual({ x: 100, y: 50 }); // Returns original coordinates
        });
    });

    describe('getCanvasInfo', () => {
        test('should return canvas info from ResponsiveCanvasManager', () => {
            const result = scaledCoordinateManager.getCanvasInfo();
            expect(result).toEqual(mockResponsiveCanvasManager.mockCanvasInfo);
        });

        test('should return default info when ResponsiveCanvasManager fails', () => {
            mockResponsiveCanvasManager.getCanvasInfo = () => {
                throw new Error('Mock error');
            };
            
            const result = scaledCoordinateManager.getCanvasInfo();
            expect(result.scaleFactor).toBe(1);
            expect(result.baseWidth).toBe(800);
            expect(result.baseHeight).toBe(600);
        });
    });

    describe('getScaleFactor', () => {
        test('should return scale factor from canvas info', () => {
            const result = scaledCoordinateManager.getScaleFactor();
            expect(result).toBe(0.8);
        });

        test('should prefer scale property over scaleFactor', () => {
            mockResponsiveCanvasManager.mockCanvasInfo.scale = 0.9;
            mockResponsiveCanvasManager.mockCanvasInfo.scaleFactor = 0.8;
            
            const result = scaledCoordinateManager.getScaleFactor();
            expect(result).toBe(0.9);
        });

        test('should return 1.0 when both scale and scaleFactor are missing', () => {
            delete (mockResponsiveCanvasManager.mockCanvasInfo as any).scale;
            delete (mockResponsiveCanvasManager.mockCanvasInfo as any).scaleFactor;
            
            const result = scaledCoordinateManager.getScaleFactor();
            expect(result).toBe(1.0);
        });
    });

    describe('validateCoordinates', () => {
        test('should validate valid coordinates', () => {
            expect(scaledCoordinateManager.validateCoordinates(10, 20)).toBe(true);
            expect(scaledCoordinateManager.validateCoordinates(0, 0)).toBe(true);
            expect(scaledCoordinateManager.validateCoordinates(-5, -10)).toBe(true);
            expect(scaledCoordinateManager.validateCoordinates(100.5, 200.7)).toBe(true);
        });

        test('should reject invalid coordinates', () => {
            expect(scaledCoordinateManager.validateCoordinates('10' as any, 20)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(10, '20' as any)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(NaN, 20)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(10, NaN)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(Infinity, 20)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(10, -Infinity)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(null: any8726 20)).toBe(false);
            expect(scaledCoordinateManager.validateCoordinates(10, undefined: any8820).toBe(false);
        });
    });

    describe('onScaleChange', () => {
        test('should register scale change callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            scaledCoordinateManager.onScaleChange(callback1);
            scaledCoordinateManager.onScaleChange(callback2);
            
            expect(scaledCoordinateManager.scaleChangeCallbacks).toContain(callback1);
            expect(scaledCoordinateManager.scaleChangeCallbacks).toContain(callback2);
        });

        test('should ignore non-function callbacks', () => {
            scaledCoordinateManager.onScaleChange('not a function' as any);
            scaledCoordinateManager.onScaleChange(null: any9584;
            scaledCoordinateManager.onScaleChange(undefined: any9648;
            
            expect(scaledCoordinateManager.scaleChangeCallbacks).toEqual([]);
        });
    });

    describe('updateScale', () => {
        test('should execute all registered callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            scaledCoordinateManager.onScaleChange(callback1);
            scaledCoordinateManager.onScaleChange(callback2);
            scaledCoordinateManager.updateScale();
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        test('should handle callback errors gracefully', () => {
            const workingCallback = jest.fn();
            const errorCallback = jest.fn(() => {
                throw new Error('Callback error');
            });
            
            scaledCoordinateManager.onScaleChange(workingCallback);
            scaledCoordinateManager.onScaleChange(errorCallback);
            
            expect(() => scaledCoordinateManager.updateScale()).not.toThrow();
            expect(workingCallback).toHaveBeenCalled();
            expect(errorCallback).toHaveBeenCalled();
        });
    });

    describe('getDebugInfo', () => {
        test('should return comprehensive debug information', () => {
            scaledCoordinateManager.onScaleChange(() => {});
            scaledCoordinateManager.onScaleChange(() => {});
            
            const debugInfo = scaledCoordinateManager.getDebugInfo();
            
            expect(debugInfo.canvasInfo).toEqual(mockResponsiveCanvasManager.mockCanvasInfo);
            expect(debugInfo.scaleFactor).toBe(0.8);
            expect(debugInfo.baseSize).toEqual({ width: 800, height: 600 });
            expect(debugInfo.scaleChangeCallbacksCount).toBe(2);
            expect(typeof debugInfo.timestamp).toBe('number');
        });
    });

    describe('cleanup', () => {
        test('should clear all callbacks', () => {
            scaledCoordinateManager.onScaleChange(() => {});
            scaledCoordinateManager.onScaleChange(() => {});
            expect(scaledCoordinateManager.scaleChangeCallbacks.length).toBe(2);
            
            scaledCoordinateManager.cleanup();
            expect(scaledCoordinateManager.scaleChangeCallbacks).toEqual([]);
        });
    });

    describe('integration scenarios', () => {
        test('should handle complete coordinate conversion workflow', () => {
            // Base coordinates
            const baseX = 400;
            const baseY = 300;
            
            // Convert to scaled coordinates
            const scaledPos = scaledCoordinateManager.getScaledPosition(baseX, baseY);
            expect(scaledPos).toEqual({ x: 320, y: 240 });
            
            // Convert back to base coordinates
            const backToBase = scaledCoordinateManager.getBasePosition(scaledPos.x, scaledPos.y);
            expect(backToBase).toEqual({ x: baseX, y: baseY });
        });

        test('should maintain precision in coordinate conversions', () => {
            const baseX = 123.456;
            const baseY = 789.012;
            
            const scaledPos = scaledCoordinateManager.getScaledPosition(baseX, baseY);
            const backToBase = scaledCoordinateManager.getBasePosition(scaledPos.x, scaledPos.y);
            
            expect(Math.abs(backToBase.x - baseX)).toBeLessThan(0.001);
            expect(Math.abs(backToBase.y - baseY)).toBeLessThan(0.001);
        });
    });
});