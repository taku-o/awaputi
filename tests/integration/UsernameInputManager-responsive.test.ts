/**
 * Integration Tests for Username Input Manager ResponsiveCanvasManager Integration
 * Tests for Issue #143 - Username input positioning fix
 */
import { jest } from '@jest/globals';
describe('UsernameInputManager ResponsiveCanvasManager Integration', () => {
    let gameEngine: any,
    let responsiveCanvasManager: any,
    let usernameInputManager: any,
    let canvas: any,
    let context: any,
    beforeEach(() => {
        // Mock Canvas and Context
        context = {
            save: jest.fn(
            restore: jest.fn(
            fillRect: jest.fn(
            strokeRect: jest.fn(
            fillText: jest.fn(
            scale: jest.fn(
        setTransform: jest.fn( };
        canvas = {
            width: 1256,
            height: 942,
            getContext: jest.fn().mockReturnValue(context),
        // Mock ResponsiveCanvasManager
        responsiveCanvasManager = {
            getCanvasInfo: jest.fn().mockReturnValue({
                scale: 1.57,
                displayWidth: 628,
                displayHeight: 471,
                actualWidth: 1256,
                actualHeight: 942,
                pixelRatio: 2,
                baseWidth: 800,
                baseHeight: 600,
            updateCanvasSize: jest.fn(
        handleResize: jest.fn()' };'
        // Mock GameEngine
        gameEngine = {
            canvas: canvas,
            responsiveCanvasManager: responsiveCanvasManager,
            debug: false,
        playerData: { username: '}'
        };
        // Mock UsernameInputManager(simplified version for integration testing
        );
        class TestUsernameInputManager {
            constructor(gameEngine {
                this.gameEngine = gameEngine;
                this.errorHandler = { handleError: jest.fn(') };'
                this.usernameInput = ';'
                this.isEditingUsername = false;
            }
            getCanvasInfo(') {'
                try {
                    const responsiveCanvasManager = this.gameEngine.responsiveCanvasManager,
                    if (responsiveCanvasManager && typeof responsiveCanvasManager.getCanvasInfo === 'function') {
                        const canvasInfo = responsiveCanvasManager.getCanvasInfo('),'
                        if (canvasInfo && typeof canvasInfo.scale === 'number' && canvasInfo.scale > 0) {
                            return canvasInfo }
                    } catch (error) {
                    if (this.gameEngine.debug') {'
                        console.warn('ResponsiveCanvasManager access failed:', error) }
                }
                return null;
            }
            transformCoordinates(baseX, baseY, canvasInfo) {
                if (!canvasInfo) return null,
                const { scale } = canvasInfo;
                return {
                    x: baseX * scale,
                    y: baseY * scale
                };
            }
            validateCoordinates(x, y, canvasInfo) {
                if (!canvasInfo) return false,
                const { actualWidth, actualHeight } = canvasInfo;
                return x >= 0 && x <= actualWidth && y >= 0 && y <= actualHeight;
            }
            renderWithResponsiveCoordinates(context, canvasInfo) {
                const LAYOUT = {
                    title: { x: 400, y: 200 };
                    description: { x: 400, y: 240 };
                    inputBox: { x: 200, y: 280, width: 400, height: 50 };
                    buttons: {
                        ok: { x: 290, y: 360, width: 100, height: 40 };
                        cancel: { x: 410, y: 360, width: 100, height: 40 }
                    },
                    helpText: { x: 400, y: 450 }
                };
                // Half-transparent overlay
                context.save(');'
                context.fillStyle = 'rgba(0,0,0,0.8')';'
                context.fillRect(0, 0, canvasInfo.actualWidth, canvasInfo.actualHeight);
                // Title rendering
                const titleCoords = this.transformCoordinates(LAYOUT.title.x, LAYOUT.title.y, canvasInfo);
                if (titleCoords && this.validateCoordinates(titleCoords.x, titleCoords.y, canvasInfo)') {'
                    context.fillStyle = '#FFFFFF',
                    context.font = `bold ${32 * canvasInfo.scale}px Arial`;
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText('ユーザー名登録', titleCoords.x, titleCoords.y);
                }
                context.restore();
                return true;
            }
        }
        usernameInputManager = new TestUsernameInputManager(gameEngine);
    }');'
    describe('coordinate system consistency', (') => {'
        it('should maintain coordinate consistency between ResponsiveCanvasManager and UsernameInputManager', () => {
            const canvasInfo = usernameInputManager.getCanvasInfo(),
            expect(canvasInfo.toBeDefined(),
            expect(canvasInfo.scale).toBe(1.57),
            expect(canvasInfo.actualWidth).toBe(1256),
            expect(canvasInfo.actualHeight).toBe(942),
            expect(canvasInfo.pixelRatio).toBe(2) }');'
        it('should transform base coordinates consistently with canvas scale', () => {
            const canvasInfo = usernameInputManager.getCanvasInfo(),
            // Center coordinates in base 800x600 system
            const centerX = 400,
            const centerY = 300,
            
            const transformed = usernameInputManager.transformCoordinates(centerX, centerY, canvasInfo),
            // Should scale to canvas coordinates
            expect(transformed.x).toBeCloseTo(628, 1), // 400 * 1.57
            expect(transformed.y).toBeCloseTo(471, 1), // 300 * 1.57
            
            // Should be within canvas bounds
            expect(usernameInputManager.validateCoordinates(transformed.x, transformed.y, canvasInfo).toBe(true) }');'
    }
    describe('canvas resize handling', (') => {'
        it('should handle canvas resize and coordinate updates', () => {
            // Initial canvas info
            let canvasInfo = usernameInputManager.getCanvasInfo(),
            const initialScale = canvasInfo.scale,
            
            // Simulate canvas resize
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 2.0,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 1600,
                actualHeight: 1200,
                pixelRatio: 2,
                baseWidth: 800,
                baseHeight: 600),
            // Get updated canvas info
            canvasInfo = usernameInputManager.getCanvasInfo(),
            expect(canvasInfo.scale).toBe(2.0),
            expect(canvasInfo.scale).not.toBe(initialScale),
            // Coordinates should update accordingly
            const transformed = usernameInputManager.transformCoordinates(400, 300, canvasInfo),
            expect(transformed.x).toBe(800),
            expect(transformed.y).toBe(600) }');'
        it('should maintain coordinate validity after resize', () => {
            // Resize to smaller canvas
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 0.75,
                displayWidth: 300,
                displayHeight: 225,
                actualWidth: 600,
                actualHeight: 450,
                pixelRatio: 1,
                baseWidth: 800,
                baseHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            const transformed = usernameInputManager.transformCoordinates(400, 300, canvasInfo);
            expect(transformed.x).toBe(300);
            expect(transformed.y).toBe(225);
            expect(usernameInputManager.validateCoordinates(transformed.x, transformed.y, canvasInfo).toBe(true);
        }');'
    }
    describe('high DPI display support', (') => {'
        it('should handle 1x pixel ratio correctly', () => {
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 1.0,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 800,
                actualHeight: 600,
                pixelRatio: 1,
                baseWidth: 800,
                baseHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            const rendered = usernameInputManager.renderWithResponsiveCoordinates(context, canvasInfo);
            expect(rendered.toBe(true);
            expect(context.save).toHaveBeenCalled();
            expect(context.restore).toHaveBeenCalled();
            expect(context.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
        }');'
        it('should handle 2x pixel ratio correctly', () => {
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 1.0,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 1600,
                actualHeight: 1200,
                pixelRatio: 2,
                baseWidth: 800,
                baseHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            const rendered = usernameInputManager.renderWithResponsiveCoordinates(context, canvasInfo);
            expect(rendered.toBe(true);
            expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1600, 1200);
        }');'
        it('should handle 3x pixel ratio correctly', () => {
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 1.0,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 2400,
                actualHeight: 1800,
                pixelRatio: 3,
                baseWidth: 800,
                baseHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            const rendered = usernameInputManager.renderWithResponsiveCoordinates(context, canvasInfo);
            expect(rendered.toBe(true);
            expect(context.fillRect).toHaveBeenCalledWith(0, 0, 2400, 1800);
        }');'
    }
    describe('fallback behavior', (') => {'
        it('should handle ResponsiveCanvasManager unavailable', () => {
            gameEngine.responsiveCanvasManager = null,
            
            const canvasInfo = usernameInputManager.getCanvasInfo(),
            expect(canvasInfo.toBeNull(),
            // Should not throw error when trying to transform coordinates
            const result = usernameInputManager.transformCoordinates(400, 300, canvasInfo),
            expect(result.toBeNull() }');'
        it('should handle ResponsiveCanvasManager method missing', () => {
            gameEngine.responsiveCanvasManager = {};
            
            const canvasInfo = usernameInputManager.getCanvasInfo();
            expect(canvasInfo.toBeNull();
        }');'
        it('should handle ResponsiveCanvasManager getCanvasInfo returning invalid data', () => {
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: -1,
                displayWidth: 800,
                displayHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            expect(canvasInfo.toBeNull();
        }');'
        it('should handle ResponsiveCanvasManager throwing error', () => {
            responsiveCanvasManager.getCanvasInfo.mockImplementation((') => {'
                throw new Error('Canvas info error') });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            expect(canvasInfo.toBeNull();
        }');'
    }
    describe('rendering integration', (') => {'
        it('should render correctly with typical desktop configuration', () => {
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 2.4,
                displayWidth: 1920,
                displayHeight: 1080,
                actualWidth: 1920,
                actualHeight: 1080,
                pixelRatio: 1,
                baseWidth: 800,
                baseHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            const rendered = usernameInputManager.renderWithResponsiveCoordinates(context, canvasInfo);
            expect(rendered.toBe(true);
            expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1920, 1080);
            expect(context.fillText').toHaveBeenCalledWith('ユーザー名登録', 960, 480);'
        }');'
        it('should render correctly with mobile configuration', () => {
            responsiveCanvasManager.getCanvasInfo.mockReturnValue({
                scale: 0.46875,
                displayWidth: 375,
                displayHeight: 281,
                actualWidth: 750,
                actualHeight: 562,
                pixelRatio: 2,
                baseWidth: 800,
                baseHeight: 600 });
            const canvasInfo = usernameInputManager.getCanvasInfo();
            const rendered = usernameInputManager.renderWithResponsiveCoordinates(context, canvasInfo);
            expect(rendered.toBe(true);
            expect(context.fillRect).toHaveBeenCalledWith(0, 0, 750, 562);
            expect(context.fillText').toHaveBeenCalledWith('ユーザー名登録', 187.5, 93.75);'
        }');'
    }
    describe('performance considerations', (') => {'
        it('should not call getCanvasInfo excessively', () => {
            // Reset mock call count
            responsiveCanvasManager.getCanvasInfo.mockClear(),
            // Call getCanvasInfo multiple times
            usernameInputManager.getCanvasInfo(),
            usernameInputManager.getCanvasInfo(),
            usernameInputManager.getCanvasInfo(),
            // Should call underlying method each time (no caching in this basic implementation),
            expect(responsiveCanvasManager.getCanvasInfo).toHaveBeenCalledTimes(3) });
    }
}');'