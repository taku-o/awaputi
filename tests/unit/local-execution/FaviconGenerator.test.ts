/**
 * FaviconGenerator.test.ts
 * Unit tests for FaviconGenerator Canvas API functionality - Issue #63 local execution support
 * 
 * Test coverage:
 * - Canvas-based favicon generation
 * - localStorage caching mechanism
 * - Multiple favicon sizes generation
 * - Error handling and fallbacks
 * 
 *, Requirements: 2.1, 2.2, 6.1, 6.2, 6.3
 */
import { jest  } from '@jest/globals';
import FaviconGenerator from '../../../src/utils/local-execution/FaviconGenerator.js';
// Type definitions
interface MockContext {
    fillStyle: string,
    strokeStyle: string;
    lineWidth: number;
    fillRect: jest.Mock<void, [number, number, number, number]>;
    strokeRect: jest.Mock<void, [number, number, number, number]>;
    beginPath: jest.Mock<void, []>;
    arc: jest.Mock<void, [number, number, number, number, number]>;
    fill: jest.Mock<void, []>;
    stroke: jest.Mock<void, []>;
    clearRect: jest.Mock<void, [number, number, number, number]>;
    createRadialGradient: jest.Mock<CanvasGradient, [number, number, number, number, number, number]>;
    createLinearGradient: jest.Mock<CanvasGradient, [number, number, number, number]>;
    drawImage: jest.Mock<void, any[]>;
    getImageData: jest.Mock<ImageData, [number, number, number, number]>;
    putImageData: jest.Mock<void, [ImageData, number, number]> }
interface MockCanvas {
    width: number,
    height: number;
    getContext: jest.Mock<MockContext | null, [string]>;
    toDataURL: jest.Mock<string, [string? , number?]>, : undefined
    toBlob?: jest.Mock<void, [(blob: Blob | null') => void, string? , number?]>, : undefined'
    style: Partial<CSSStyleDeclaration>;
interface MockLink {
    rel: string,
    type: string;
    sizes: string;
    href: string;
    id: string;
    remove?: jest.Mock<void, []> }
interface MockDocument {
    createElement: jest.Mock<MockCanvas | MockLink | any, [string]>;
    head?: {
        appendChil,d: jest.Mock<void, [any]>;
        removeChild: jest.Mock<void, [any]>;
        querySelector: jest.Mock<MockLink | null, [string]>;
        querySelectorAll: jest.Mock<NodeListOf<MockLink>, [string]> };
    getElementById: jest.Mock<any, [string]>;
}
interface MockLocalStorage {
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]> }
interface GenerateConfig {
    sizes?: number[];
    bubbleColor?: string;
    backgroundColor?: string;
    highlightColor?: string;
    enableCaching?: boolean;
    enableBubbleDesign?: boolean;
    cacheExpiry?: number;
    injectIntoDOM?: boolean;
    replaceExisting?: boolean;
    enableHighDPI?: boolean;
    preferBlob?: boolean;
interface GenerateResult {
    success: boolean,
    generated: number;
    fromCache?: number;
    error?: string;
    errors?: string[];
interface CanvasGradient {
    addColorStop: jest.Mock<void, [number, string]> }
describe('FaviconGenerator', () => {
    let mockCanvas: MockCanvas,
    let mockContext: MockContext,
    let mockDocument: MockDocument,
    let mockLocalStorage: MockLocalStorage,
    beforeEach((') => {'
        // Mock Canvas and Context
        mockContext = {
            fillStyle: ','
            strokeStyle: ','
            lineWidth: 1,
            fillRect: jest.fn(
            strokeRect: jest.fn(
            beginPath: jest.fn(
            arc: jest.fn(
            fill: jest.fn(
            stroke: jest.fn(
            clearRect: jest.fn(
            createRadialGradient: jest.fn(() => ({
                addColorStop: jest.fn()),
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()),
            drawImage: jest.fn(
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(4), // RGBA pixel data
                width: 32,
                height: 32
    }) as ImageData),
        putImageData: jest.fn(),
        mockCanvas = {
            width: 32,
            height: 32,
            getContext: jest.fn(() => mockContext),
            toDataURL: jest.fn((') => 'data:image/png,base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),'
            toBlob: jest.fn((callback: (blob: Blob | null) => void') => {'
                callback(new Blob(['fake-image-data'], { type: 'image/png' )),
            style: {}
        };
        mockDocument = {
            createElement: jest.fn((tag: string') => {'
                if (tag === 'canvas') return mockCanvas,
                if (tag === 'link') return {
                    rel: ','
                    type: ','
                    sizes: ','
                    href: ','
                    id: '}) as MockLink;'
                return {});
            }),
            head: {
                appendChild: jest.fn(
                removeChild: jest.fn(
                querySelector: jest.fn(() => null),
                querySelectorAll: jest.fn(() => [] as unknown as NodeListOf<MockLink>) }),
            getElementById: jest.fn(() => null),
    );
        mockLocalStorage = {
            getItem: jest.fn(() => null),
            setItem: jest.fn(
        removeItem: jest.fn()
        ),
        // Setup global mocks
        (global: any).document = mockDocument,
        (global: any).localStorage = mockLocalStorage,
        (global: any).window = {
            document: mockDocument,
            localStorage: mockLocalStorage,);
        // Clear all mocks before each test
        jest.clearAllMocks();
    );
    afterEach(() => {
        jest.clearAllMocks() }');'
    describe('generateMissingFavicons', (') => {'
        test('should generate basic favicon with default settings', async () => {
            const result = await FaviconGenerator.generateMissingFavicons(),
            expect(result.success).toBe(true),
            expect(result.generated).toBeGreaterThan(0),
            expect(mockDocument.createElement').toHaveBeenCalledWith('canvas'),'
            expect(mockCanvas.getContext').toHaveBeenCalledWith('2d'),'
            expect(mockContext.fillRect).toHaveBeenCalled() }');'
        test('should generate multiple favicon sizes', async () => {
            const config: GenerateConfig = {
                sizes: [16, 32, 48],
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.generated).toBe(3);
            expect(mockDocument.createElement).toHaveBeenCalledTimes(3); // One canvas per size
        }');'
        test('should use custom colors and design', async (') => {'
            const config: GenerateConfig = {
                sizes: [32],
                bubbleColor: '#FF5722',
                backgroundColor: '#E3F2FD',
                highlightColor: '#FFF',
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            // Verify colors were applied to context
            expect(mockContext.fillStyle').toContain('#');'
        }');'
        test('should handle Canvas creation failure', async () => {
            mockDocument.createElement.mockImplementation((tag: string') => {'
                if (tag === 'canvas') throw new Error('Canvas not supported'),
                return {};
            });
            const result = await FaviconGenerator.generateMissingFavicons();
            expect(result.success).toBe(false);
            expect(result.error').toContain('Canvas not supported');'
        }');'
        test('should handle getContext failure', async () => {
            mockCanvas.getContext.mockReturnValue(null),
            const result = await FaviconGenerator.generateMissingFavicons(),
            expect(result.success).toBe(false),
            expect(result.error').toContain('Canvas context') }');
        test('should handle toDataURL failure', async () => {
            mockCanvas.toDataURL.mockImplementation((') => {'
                throw new Error('toDataURL failed') });
            const result = await FaviconGenerator.generateMissingFavicons();
            expect(result.success).toBe(false);
            expect(result.error').toContain('toDataURL failed');'
        }');'
    }
    describe('Caching mechanism', (') => {'
        test('should cache generated favicons in localStorage', async () => {
            const config: GenerateConfig = {
                sizes: [16],
                enableCaching: true,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalled(');'
            // Check if cache key follows expected format
            const setItemCalls = mockLocalStorage.setItem.mock.calls;
            const cacheCall = setItemCalls.find(call => call[0].includes('awaputi_favicon_cache');
            expect(cacheCall).toBeDefined();
        }');'
        test('should retrieve cached favicons', async (') => {'
            // Mock existing cache
            const cachedData = JSON.stringify({
                '16': 'data:image/png,base64,cached-favicon-16'),
        timestamp: Date.now( });
            mockLocalStorage.getItem.mockReturnValue(cachedData);
            const config: GenerateConfig = {
                sizes: [16],
                enableCaching: true,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.fromCache).toBeGreaterThan(0);
            // Should not create new canvas if using cache
            expect(mockDocument.createElement').not.toHaveBeenCalledWith('canvas');'
        }');'
        test('should handle cache expiration', async () => {
            // Mock expired cache (older than 24 hours}');'
            const expiredData = JSON.stringify({
                '16': 'data:image/png,base64,expired-favicon-16'),
                timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
            });
            mockLocalStorage.getItem.mockReturnValue(expiredData);
            const config: GenerateConfig = {
                sizes: [16],
                enableCaching: true,
                cacheExpiry: 24 * 60 * 60 * 1000 // 24 hours
            };
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.fromCache).toBe(0);
            expect(result.generated).toBe(1);
            // Should regenerate favicon
            expect(mockDocument.createElement').toHaveBeenCalledWith('canvas');'
        }');'
        test('should handle corrupted cache data', async (') => {'
            mockLocalStorage.getItem.mockReturnValue('invalid-json-data'),
            const config: GenerateConfig = {
                sizes: [16],
                enableCaching: true,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.generated).toBe(1);
            // Should regenerate when cache is corrupted
            expect(mockDocument.createElement').toHaveBeenCalledWith('canvas');'
        }');'
        test('should handle localStorage unavailability', async () => {
            (global: any).localStorage = null,
            const config: GenerateConfig = {
                sizes: [16],
                enableCaching: true,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.generated).toBe(1);
            // Should work without caching
            expect(mockDocument.createElement').toHaveBeenCalledWith('canvas');'
        }');'
    }
    describe('DOM integration', (') => {'
        test('should inject favicon link elements into DOM', async () => {
            const config: GenerateConfig = {
                sizes: [16, 32],
                injectIntoDOM: true,
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(mockDocument.createElement').toHaveBeenCalledWith('link');'
            expect(mockDocument.head!.appendChild).toHaveBeenCalled();
        }');'
        test('should replace existing favicon links', async (') => {'
            // Mock existing favicon link
            const existingLink: MockLink = { rel: 'icon', href: '/old-favicon.png', remove: jest.fn('), type: ', sizes: ', id: '};
            mockDocument.head!.querySelector.mockReturnValue(existingLink);
            const config: GenerateConfig = {
                sizes: [16],
                injectIntoDOM: true,
                replaceExisting: true,
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(existingLink.remove).toHaveBeenCalled();
        }');'
        test('should preserve existing favicon links when replaceExisting is false', async (') => {'
            const existingLink: MockLink = { rel: 'icon', href: '/old-favicon.png', remove: jest.fn('), type: ', sizes: ', id: '};
            mockDocument.head!.querySelector.mockReturnValue(existingLink);
            const config: GenerateConfig = {
                sizes: [16],
                injectIntoDOM: true,
                replaceExisting: false,
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(existingLink.remove).not.toHaveBeenCalled();
        }');'
    }
    describe('Design quality and visual consistency', (') => {'
        test('should create bubble design with gradients', async () => {
            const config: GenerateConfig = {
                sizes: [32],
                enableBubbleDesign: true,
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(mockContext.createRadialGradient).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalled(); // For bubble circles
            expect(mockContext.fill).toHaveBeenCalled();
        }');'
        test('should create appropriate sizes for different favicon uses', async () => {
            const config: GenerateConfig = {
                sizes: [16, 32, 48, 192], // Different use cases
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.generated).toBe(4');'
            // Each size should have been set correctly
            const canvasCreationCalls = mockDocument.createElement.mock.calls.filter(call => call[0] === 'canvas');
            expect(canvasCreationCalls).toHaveLength(4);
        }');'
        test('should handle high-DPI (retina') displays', async () => {'
            const config: GenerateConfig = {
                sizes: [32],
                enableHighDPI: true,
                enableCaching: false,;
            // Mock high DPI environment
            (global: any).devicePixelRatio = 2,
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            // Canvas should be created at 2x resolution for high DPI
            expect(mockCanvas.width).toBe(32); // Still 32 logical pixels
        }');'
    }
    describe('Performance and optimization', (') => {'
        test('should complete favicon generation quickly', async () => {
            const startTime = Date.now(),
            const config: GenerateConfig = {
                sizes: [16, 32, 48],
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            expect(result.success).toBe(true);
            expect(executionTime).toBeLessThan(500); // Should complete in under 500ms
        }');'
        test('should clean up Canvas elements', async () => {
            const config: GenerateConfig = {
                sizes: [16, 32],
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            // Canvas elements should be created but not left in DOM
            expect(mockDocument.head!.appendChild).not.toHaveBeenCalledWith(mockCanvas);
        }');'
        test('should handle memory limitations gracefully', async () => {
            // Mock Canvas toDataURL to fail due to memory issues
            let callCount = 0,
            mockCanvas.toDataURL.mockImplementation(() => {
                callCount++,
                if (callCount > 2') {'
                    throw new Error('Out of memory') }
                return 'data:image/png;base64,valid-data';
            });
            const config: GenerateConfig = {
                sizes: [16, 32, 48], // Third one will fail
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            expect(result.generated).toBe(2); // First two should succeed
            expect(result.errors).toHaveLength(1); // Third should error
        }');'
    }
    describe('Browser compatibility', (') => {'
        test('should work with basic Canvas support', async () => {
            // Remove advanced Canvas features
            delete (mockContext.createRadialGradient),
            delete (mockContext.createLinearGradient),
            const config: GenerateConfig = {
                sizes: [16],
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            // Should fallback to solid colors when gradients unavailable
            expect(mockContext.fillRect).toHaveBeenCalled();
        }');'
        test('should handle missing toBlob method', async () => {
            delete mockCanvas.toBlob,
            const config: GenerateConfig = {
                sizes: [16],
                preferBlob: true,
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            // Should fallback to toDataURL
            expect(mockCanvas.toDataURL).toHaveBeenCalled();
        }');'
        test('should work in environments without document.head', async () => {
            delete mockDocument.head,
            const config: GenerateConfig = {
                sizes: [16],
                injectIntoDOM: true,
                enableCaching: false,;
            const result = await FaviconGenerator.generateMissingFavicons(config);
            expect(result.success).toBe(true);
            // Should generate favicon even if DOM injection fails
            expect(result.generated).toBe(1);
        });
    }
}');'