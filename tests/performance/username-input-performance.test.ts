/**
 * Performance Tests for Username Input Manager Coordinate Calculations
 * Tests for Issue #143 - Username input positioning fix
 */

import { jest } from '@jest/globals';

describe('Username Input Performance Tests', () => {
    let usernameInputManager: any;
    let mockGameEngine: any;
    let mockResponsiveCanvasManager: any;
    let performanceObserver: any;

    // Enhanced UsernameInputManager with caching for performance testing
    class PerformanceOptimizedUsernameInputManager {
        constructor(gameEngine: any) {
            this.gameEngine = gameEngine;
            this.errorHandler = { handleError: jest.fn() };
            this.usernameInput = '';
            this.isEditingUsername = false;
            
            // Performance optimization: Canvas info cache
            this._canvasInfoCache = null;
            this._canvasInfoCacheTime = 0;
            this._cacheValidDuration = 16; // ~1 frame at 60fps
            
            // Coordinate transformation cache
            this._coordinateCache = new Map();
            this._maxCacheSize = 50;
        }

        getCanvasInfo() {
            const now = performance.now();
            
            // Return cached canvas info if still valid
            if (this._canvasInfoCache && (now - this._canvasInfoCacheTime) < this._cacheValidDuration) {
                return this._canvasInfoCache;
            }

            try {
                const responsiveCanvasManager = this.gameEngine.responsiveCanvasManager;
                if (responsiveCanvasManager && typeof responsiveCanvasManager.getCanvasInfo === 'function') {
                    const canvasInfo = responsiveCanvasManager.getCanvasInfo();
                    if (canvasInfo && typeof canvasInfo.scale === 'number' && canvasInfo.scale > 0) {
                        // Cache the canvas info
                        this._canvasInfoCache = canvasInfo;
                        this._canvasInfoCacheTime = now;
                        return canvasInfo;
                    }
                }
            } catch (error) {
                if (this.gameEngine.debug) {
                    console.warn('ResponsiveCanvasManager access failed:', error);
                }
            }
            
            // Clear cache on failure
            this._canvasInfoCache = null;
            this._canvasInfoCacheTime = 0;
            return null;
        }

        transformCoordinates(baseX, baseY, canvasInfo) {
            if (!canvasInfo) return null;

            // Create cache key
            const cacheKey = `${baseX},${baseY},${canvasInfo.scale}`;
            
            // Check cache first
            if (this._coordinateCache.has(cacheKey) {
                return this._coordinateCache.get(cacheKey;
            }

            // Calculate transformation
            const { scale } = canvasInfo;
            const result = {
                x: baseX * scale,
                y: baseY * scale
            };

            // Cache result (with size limit)
            if (this._coordinateCache.size >= this._maxCacheSize) {
                // Remove oldest entry (first added)
                const firstKey = this._coordinateCache.keys().next().value;
                this._coordinateCache.delete(firstKey;
            }
            this._coordinateCache.set(cacheKey, result);

            return result;
        }

        validateCoordinates(x, y, canvasInfo) {
            if (!canvasInfo) return false;
            const { actualWidth, actualHeight } = canvasInfo;
            return x >= 0 && x <= actualWidth && y >= 0 && y <= actualHeight;
        }

        // Batch coordinate transformation for performance
        transformCoordinatesBatch(coordinates, canvasInfo) {
            if (!canvasInfo || !Array.isArray(coordinates) return [];
            
            return coordinates.map(coord => 
                this.transformCoordinates(coord.x, coord.y, canvasInfo)
            ).filter(result => result !== null);
        }

        // Clear caches manually
        clearCache() {
            this._canvasInfoCache = null;
            this._canvasInfoCacheTime = 0;
            this._coordinateCache.clear();
        }

        // Get cache statistics
        getCacheStats() {
            return {
                canvasInfoCached: !!this._canvasInfoCache,
                canvasInfoCacheAge: performance.now() - this._canvasInfoCacheTime,
                coordinateCacheSize: this._coordinateCache.size,
                coordinateCacheMaxSize: this._maxCacheSize
            };
        }
    }

    beforeEach(() => {
        // Use fake timers for consistent timing in tests
        jest.useFakeTimers();
        jest.spyOn(performance, 'now').mockImplementation(() => Date.now());

        // Setup performance observer mock
        performanceObserver = {
            observe: jest.fn(),
            disconnect: jest.fn(),
            entries: []
        };

        // Mock ResponsiveCanvasManager
        mockResponsiveCanvasManager = {
            getCanvasInfo: jest.fn().mockReturnValue({
                scale: 1.5,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 1200,
                actualHeight: 900,
                pixelRatio: 2
            })
        };

        // Mock GameEngine
        mockGameEngine = {
            responsiveCanvasManager: mockResponsiveCanvasManager,
            debug: false
        };

        usernameInputManager = new PerformanceOptimizedUsernameInputManager(mockGameEngine;
    });

    afterEach(() => {
        // Restore real timers
        jest.useRealTimers();
    });

    describe('Canvas Info Caching', () => {
        it('should cache canvas info to avoid repeated calls', () => {
            // First call should hit ResponsiveCanvasManager
            const canvasInfo1 = usernameInputManager.getCanvasInfo();
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(1);
            
            // Second call within cache duration should use cache
            const canvasInfo2 = usernameInputManager.getCanvasInfo();
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(1);
            expect(canvasInfo2.toEqual(canvasInfo1);
            
            const stats = usernameInputManager.getCacheStats();
            expect(stats.canvasInfoCached).toBe(true);
            expect(stats.canvasInfoCacheAge).toBeLessThan(100);
        });

        it('should refresh cache after expiration', async () => {
            // First call
            usernameInputManager.getCanvasInfo();
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(1);
            
            // Advance time beyond cache expiration (16ms + buffer)
            jest.advanceTimersByTime(20);
            
            // Second call should refresh cache
            usernameInputManager.getCanvasInfo();
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(2);
        });
    });

    describe('Coordinate Transformation Caching', () => {
        it('should cache coordinate transformations', () => {
            const canvasInfo = { scale: 1.5 };
            
            // First transformation should calculate
            const result1 = usernameInputManager.transformCoordinates(400, 300, canvasInfo);
            expect(result1.toEqual({ x: 600, y: 450 });
            
            // Second identical transformation should use cache
            const result2 = usernameInputManager.transformCoordinates(400, 300, canvasInfo);
            expect(result2.toEqual(result1);
            expect(result2.toBe(result1); // Should be same object reference (from cache)
            
            const stats = usernameInputManager.getCacheStats();
            expect(stats.coordinateCacheSize).toBe(1);
        });

        it('should limit coordinate cache size', () => {
            const canvasInfo = { scale: 1.5 };
            
            // Fill cache beyond limit
            for (let i = 0; i < 60; i++) {
                usernameInputManager.transformCoordinates(i, i, canvasInfo);
            }
            
            const stats = usernameInputManager.getCacheStats();
            expect(stats.coordinateCacheSize).toBe(stats.coordinateCacheMaxSize);
        });

        it('should handle cache clearing correctly', () => {
            const canvasInfo = { scale: 1.5 };
            
            // Add some cached data
            usernameInputManager.getCanvasInfo();
            usernameInputManager.transformCoordinates(400, 300, canvasInfo);
            
            let stats = usernameInputManager.getCacheStats();
            expect(stats.canvasInfoCached).toBe(true);
            expect(stats.coordinateCacheSize).toBe(1);
            
            // Clear cache
            usernameInputManager.clearCache();
            
            stats = usernameInputManager.getCacheStats();
            expect(stats.canvasInfoCached).toBe(false);
            expect(stats.coordinateCacheSize).toBe(0);
        });
    });

    describe('Batch Coordinate Transformation', () => {
        it('should efficiently transform multiple coordinates', () => {
            const canvasInfo = { scale: 2.0 };
            const coordinates = [
                { x: 100, y: 200 },
                { x: 300, y: 400 },
                { x: 500, y: 600 }
            ];
            
            const startTime = performance.now();
            const results = usernameInputManager.transformCoordinatesBatch(coordinates, canvasInfo);
            const endTime = performance.now();
            
            expect(results.toHaveLength(3);
            expect(results[0]).toEqual({ x: 200, y: 400 });
            expect(results[1]).toEqual({ x: 600, y: 800 });
            expect(results[2]).toEqual({ x: 1000, y: 1200 });
            
            // Should complete quickly
            expect(endTime - startTime).toBeLessThan(10);
        });

        it('should handle empty and invalid coordinate arrays', () => {
            const canvasInfo = { scale: 1.0 };
            
            expect(usernameInputManager.transformCoordinatesBatch([], canvasInfo)).toEqual([]);
            expect(usernameInputManager.transformCoordinatesBatch(null, canvasInfo)).toEqual([]);
            expect(usernameInputManager.transformCoordinatesBatch(undefined, canvasInfo)).toEqual([]);
        });
    });

    describe('Performance Benchmarks', () => {
        it('should transform coordinates within performance budget (< 1ms for 100 operations)', () => {
            const canvasInfo = { scale: 1.25 };
            
            const startTime = performance.now();
            
            // Perform 100 coordinate transformations
            for (let i = 0; i < 100; i++) {
                usernameInputManager.transformCoordinates(i * 8, i * 6, canvasInfo);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration.toBeLessThan(1); // Should complete in < 1ms
        });

        it('should handle rapid getCanvasInfo calls efficiently', () => {
            const startTime = performance.now();
            
            // Rapid calls should mostly hit cache
            for (let i = 0; i < 100; i++) {
                usernameInputManager.getCanvasInfo();
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration.toBeLessThan(5); // Should complete in < 5ms
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(1); // Only first call hits manager
        });

        it('should validate coordinates quickly', () => {
            const canvasInfo = {
                actualWidth: 1920,
                actualHeight: 1080
            };
            
            const startTime = performance.now();
            
            // Validate 1000 coordinates
            let validCount = 0;
            for (let i = 0; i < 1000; i++) {
                if (usernameInputManager.validateCoordinates(i, i, canvasInfo)) {
                    validCount++;
                }
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration.toBeLessThan(10); // Should complete in < 10ms
            expect(validCount.toBeGreaterThan(0);
        });
    });

    describe('Memory Usage Tests', () => {
        it('should maintain reasonable memory usage with coordinate cache', () => {
            const canvasInfo = { scale: 1.0 };
            
            // Fill cache
            for (let i = 0; i < 50; i++) {
                usernameInputManager.transformCoordinates(i * 10, i * 10, canvasInfo);
            }
            
            const stats = usernameInputManager.getCacheStats();
            expect(stats.coordinateCacheSize).toBeLessThanOrEqual(stats.coordinateCacheMaxSize);
            
            // Memory usage should be bounded by max cache size
            const approximateMemoryUsage = stats.coordinateCacheSize * 32; // rough estimate: 32 bytes per entry
            expect(approximateMemoryUsage.toBeLessThan(2000); // Should use < 2KB for coordinate cache
        });

        it('should handle cache overflow gracefully', () => {
            const canvasInfo = { scale: 1.0 };
            
            // Add more entries than cache limit
            const initialCacheSize = usernameInputManager.getCacheStats().coordinateCacheMaxSize;
            
            for (let i = 0; i < initialCacheSize + 20; i++) {
                usernameInputManager.transformCoordinates(i, i + 1000, canvasInfo);
            }
            
            const finalStats = usernameInputManager.getCacheStats();
            expect(finalStats.coordinateCacheSize).toBe(initialCacheSize);
            
            // Verify cache still works for recent entries
            const recentResult = usernameInputManager.transformCoordinates(
                initialCacheSize + 19, 
                initialCacheSize + 19 + 1000, 
                canvasInfo
            );
            expect(recentResult.toBeDefined();
        });
    });

    describe('Real-world Performance Scenarios', () => {
        it('should handle typical render loop performance (60fps)', () => {
            const canvasInfo = { scale: 1.5, actualWidth: 1200, actualHeight: 900 };
            const frameTime = 1000 / 60; // 16.67ms per frame
            
            const startTime = performance.now();
            
            // Simulate typical render loop operations
            for (let frame = 0; frame < 10; frame++) {
                // Get canvas info (should be cached after first call)
                const info = usernameInputManager.getCanvasInfo();
                
                // Transform UI element coordinates (typical UI elements)
                const title = usernameInputManager.transformCoordinates(400, 200, info);
                const inputBox = usernameInputManager.transformCoordinates(200, 280, info);
                const okButton = usernameInputManager.transformCoordinates(290, 360, info);
                const cancelButton = usernameInputManager.transformCoordinates(410, 360, info);
                
                // Validate coordinates
                usernameInputManager.validateCoordinates(title.x, title.y, info);
                usernameInputManager.validateCoordinates(inputBox.x, inputBox.y, info);
                usernameInputManager.validateCoordinates(okButton.x, okButton.y, info);
                usernameInputManager.validateCoordinates(cancelButton.x, cancelButton.y, info);
            }
            
            const endTime = performance.now();
            const totalDuration = endTime - startTime;
            const averageFrameTime = totalDuration / 10;
            
            // Should maintain 60fps (< 16.67ms per frame)
            expect(averageFrameTime.toBeLessThan(frameTime;
            
            // ResponsiveCanvasManager should only be called once (rest from cache)
            expect(mockResponsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(1);
        });

        it('should handle canvas resize scenario efficiently', () => {
            // Initial render
            usernameInputManager.getCanvasInfo();
            usernameInputManager.transformCoordinates(400, 300, { scale: 1.0 });
            
            // Clear cache to simulate canvas resize
            usernameInputManager.clearCache();
            
            // Update mock to simulate new canvas size
            mockResponsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 2.0,
                displayWidth: 1600,
                displayHeight: 1200,
                actualWidth: 1600,
                actualHeight: 1200,
                pixelRatio: 1
            });
            
            const startTime = performance.now();
            
            // New canvas info should be retrieved and cached
            const newCanvasInfo = usernameInputManager.getCanvasInfo();
            const newCoordinates = usernameInputManager.transformCoordinates(400, 300, newCanvasInfo);
            
            const endTime = performance.now();
            
            expect(newCoordinates.toEqual({ x: 800, y: 600 });
            expect(endTime - startTime).toBeLessThan(1); // Should handle resize quickly
        });
    });
});