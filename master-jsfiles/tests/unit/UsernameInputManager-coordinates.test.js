/**
 * Unit Tests for Username Input Manager Coordinate Transformation
 * Tests for Issue #143 - Username input positioning fix
 */

import { jest } from '@jest/globals';

// Mock UsernameInputManager for isolated testing
class MockUsernameInputManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = { handleError: jest.fn() };
    }

    // Copy coordinate transformation methods from UsernameInputManager
    getCanvasInfo() {
        try {
            const responsiveCanvasManager = this.gameEngine.responsiveCanvasManager;
            if (responsiveCanvasManager && typeof responsiveCanvasManager.getCanvasInfo === 'function') {
                const canvasInfo = responsiveCanvasManager.getCanvasInfo();
                if (canvasInfo && typeof canvasInfo.scale === 'number' && canvasInfo.scale > 0) {
                    return canvasInfo;
                }
            }
        } catch (error) {
            if (this.gameEngine.debug) {
                console.warn('ResponsiveCanvasManager access failed:', error);
            }
        }
        return null;
    }

    transformCoordinates(baseX, baseY, canvasInfo) {
        if (!canvasInfo) return null;
        const { scale } = canvasInfo;
        return {
            x: baseX * scale,
            y: baseY * scale
        };
    }

    validateCoordinates(x, y, canvasInfo) {
        if (!canvasInfo) return false;
        const { actualWidth, actualHeight } = canvasInfo;
        return x >= 0 && x <= actualWidth && y >= 0 && y <= actualHeight;
    }

    logCoordinateDebug(context, canvasInfo, transformedCoords) {
        if (this.gameEngine.debug) {
            console.log('Username input coordinate debug:', {
                canvasInfo: {
                    scale: canvasInfo?.scale,
                    displaySize: canvasInfo ? `${canvasInfo.displayWidth}x${canvasInfo.displayHeight}` : 'N/A',
                    actualSize: canvasInfo ? `${canvasInfo.actualWidth}x${canvasInfo.actualHeight}` : 'N/A',
                    pixelRatio: canvasInfo?.pixelRatio
                },
                transformedCoordinates: transformedCoords,
                fallbackMode: !canvasInfo
            });
        }
    }
}

describe('UsernameInputManager Coordinate Transformation', () => {
    let manager;
    let mockGameEngine;
    let mockResponsiveCanvasManager;

    beforeEach(() => {
        // Setup mock canvas info for different scenarios
        mockResponsiveCanvasManager = {
            getCanvasInfo: jest.fn()
        };

        mockGameEngine = {
            responsiveCanvasManager: mockResponsiveCanvasManager,
            debug: false
        };

        manager = new MockUsernameInputManager(mockGameEngine);
    });

    describe('getCanvasInfo', () => {
        it('should return canvas info when ResponsiveCanvasManager is available', () => {
            const mockCanvasInfo = {
                scale: 1.5,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 1200,
                actualHeight: 900,
                pixelRatio: 2
            };
            
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue(mockCanvasInfo);

            const result = manager.getCanvasInfo();
            expect(result).toEqual(mockCanvasInfo);
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(1);
        });

        it('should return null when ResponsiveCanvasManager is not available', () => {
            mockGameEngine.responsiveCanvasManager = null;
            const result = manager.getCanvasInfo();
            expect(result).toBeNull();
        });

        it('should return null when getCanvasInfo method throws error', () => {
            mockResponsiveCanvasManager.getCanvasInfo.mockImplementation(() => {
                throw new Error('Canvas info access failed');
            });

            const result = manager.getCanvasInfo();
            expect(result).toBeNull();
        });

        it('should return null when canvas info has invalid scale', () => {
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 0,
                displayWidth: 800,
                displayHeight: 600
            });

            const result = manager.getCanvasInfo();
            expect(result).toBeNull();
        });
    });

    describe('transformCoordinates', () => {
        it('should transform base coordinates correctly with scale factor 1', () => {
            const canvasInfo = { scale: 1 };
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            
            expect(result).toEqual({ x: 400, y: 300 });
        });

        it('should transform base coordinates correctly with scale factor 1.5', () => {
            const canvasInfo = { scale: 1.5 };
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            
            expect(result).toEqual({ x: 600, y: 450 });
        });

        it('should transform base coordinates correctly with scale factor 2', () => {
            const canvasInfo = { scale: 2 };
            const result = manager.transformCoordinates(200, 150, canvasInfo);
            
            expect(result).toEqual({ x: 400, y: 300 });
        });

        it('should transform base coordinates correctly with scale factor 0.5', () => {
            const canvasInfo = { scale: 0.5 };
            const result = manager.transformCoordinates(800, 600, canvasInfo);
            
            expect(result).toEqual({ x: 400, y: 300 });
        });

        it('should return null when canvasInfo is null', () => {
            const result = manager.transformCoordinates(400, 300, null);
            expect(result).toBeNull();
        });

        it('should handle zero coordinates correctly', () => {
            const canvasInfo = { scale: 1.5 };
            const result = manager.transformCoordinates(0, 0, canvasInfo);
            
            expect(result).toEqual({ x: 0, y: 0 });
        });
    });

    describe('validateCoordinates', () => {
        const canvasInfo = {
            actualWidth: 1200,
            actualHeight: 900
        };

        it('should validate coordinates within bounds', () => {
            expect(manager.validateCoordinates(600, 450, canvasInfo)).toBe(true);
            expect(manager.validateCoordinates(0, 0, canvasInfo)).toBe(true);
            expect(manager.validateCoordinates(1200, 900, canvasInfo)).toBe(true);
        });

        it('should reject coordinates outside bounds', () => {
            expect(manager.validateCoordinates(-1, 450, canvasInfo)).toBe(false);
            expect(manager.validateCoordinates(600, -1, canvasInfo)).toBe(false);
            expect(manager.validateCoordinates(1201, 450, canvasInfo)).toBe(false);
            expect(manager.validateCoordinates(600, 901, canvasInfo)).toBe(false);
        });

        it('should return false when canvasInfo is null', () => {
            expect(manager.validateCoordinates(600, 450, null)).toBe(false);
        });
    });

    describe('coordinate transformation with different pixel ratios', () => {
        it('should handle 1x pixel ratio correctly', () => {
            const canvasInfo = {
                scale: 1,
                pixelRatio: 1,
                actualWidth: 800,
                actualHeight: 600
            };
            
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            expect(result).toEqual({ x: 400, y: 300 });
            expect(manager.validateCoordinates(result.x, result.y, canvasInfo)).toBe(true);
        });

        it('should handle 2x pixel ratio correctly', () => {
            const canvasInfo = {
                scale: 1,
                pixelRatio: 2,
                actualWidth: 1600,
                actualHeight: 1200
            };
            
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            expect(result).toEqual({ x: 400, y: 300 });
            expect(manager.validateCoordinates(result.x, result.y, canvasInfo)).toBe(true);
        });

        it('should handle 3x pixel ratio correctly', () => {
            const canvasInfo = {
                scale: 1.5,
                pixelRatio: 3,
                actualWidth: 3600,
                actualHeight: 2700
            };
            
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            expect(result).toEqual({ x: 600, y: 450 });
            expect(manager.validateCoordinates(result.x, result.y, canvasInfo)).toBe(true);
        });
    });

    describe('fallback coordinate calculations', () => {
        it('should handle missing ResponsiveCanvasManager gracefully', () => {
            mockGameEngine.responsiveCanvasManager = undefined;
            
            const canvasInfo = manager.getCanvasInfo();
            expect(canvasInfo).toBeNull();
            
            // Fallback coordinate calculation should work
            const fallbackResult = manager.transformCoordinates(400, 300, {
                scale: 800 / 800 // Equivalent to canvas.width / 800 fallback
            });
            expect(fallbackResult).toEqual({ x: 400, y: 300 });
        });
    });

    describe('logCoordinateDebug', () => {
        beforeEach(() => {
            console.log = jest.fn();
        });

        it('should log debug information when debug mode is enabled', () => {
            mockGameEngine.debug = true;
            const canvasInfo = {
                scale: 1.5,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 1200,
                actualHeight: 900,
                pixelRatio: 2
            };
            
            const transformedCoords = { x: 600, y: 450 };
            
            manager.logCoordinateDebug(null, canvasInfo, transformedCoords);
            
            expect(console.log).toHaveBeenCalledWith('Username input coordinate debug:', {
                canvasInfo: {
                    scale: 1.5,
                    displaySize: '800x600',
                    actualSize: '1200x900',
                    pixelRatio: 2
                },
                transformedCoordinates: transformedCoords,
                fallbackMode: false
            });
        });

        it('should not log when debug mode is disabled', () => {
            mockGameEngine.debug = false;
            
            manager.logCoordinateDebug(null, {}, {});
            
            expect(console.log).not.toHaveBeenCalled();
        });
    });

    describe('integration scenarios', () => {
        it('should handle typical desktop scenario (1920x1080)', () => {
            const canvasInfo = {
                scale: 2.4,
                displayWidth: 1920,
                displayHeight: 1080,
                actualWidth: 1920,
                actualHeight: 1080,
                pixelRatio: 1
            };
            
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue(canvasInfo);
            
            // Test center coordinates (400, 300 in base 800x600 system)
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            expect(result).toEqual({ x: 960, y: 720 });
            expect(manager.validateCoordinates(result.x, result.y, canvasInfo)).toBe(true);
        });

        it('should handle typical mobile scenario (375x667)', () => {
            const canvasInfo = {
                scale: 0.46875,
                displayWidth: 375,
                displayHeight: 667,
                actualWidth: 375,
                actualHeight: 667,
                pixelRatio: 2
            };
            
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue(canvasInfo);
            
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            expect(result).toEqual({ x: 187.5, y: 140.625 });
            expect(manager.validateCoordinates(result.x, result.y, canvasInfo)).toBe(true);
        });

        it('should handle high DPI retina display scenario', () => {
            const canvasInfo = {
                scale: 1.5,
                displayWidth: 1440,
                displayHeight: 900,
                actualWidth: 2880,
                actualHeight: 1800,
                pixelRatio: 2
            };
            
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue(canvasInfo);
            
            const result = manager.transformCoordinates(400, 300, canvasInfo);
            expect(result).toEqual({ x: 600, y: 450 });
            expect(manager.validateCoordinates(result.x, result.y, canvasInfo)).toBe(true);
        });
    });
});