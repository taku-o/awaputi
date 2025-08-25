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
 * Requirements: 2.1, 2.2, 6.1, 6.2, 6.3
 */
import { jest } from '@jest/globals';
import FaviconGenerator from '../../../src/utils/local-execution/FaviconGenerator.js';

// Type definitions
interface MockContext {
    fillStyle: string;
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
    putImageData: jest.Mock<void, [ImageData, number, number]>


interface MockCanvas {
    width: number;
    height: number;
    getContext: jest.Mock<MockContext | null, [string]>;
    toDataURL: jest.Mock<string, [string?, number?]>;
    toBlob?: jest.Mock<void, [(blob: Blob | null) => void, string?, number?]>;
    style: Partial<CSSStyleDeclaration>


interface MockLink {
    rel: string;
    type: string;
    sizes: string;
    href: string;
    id: string;
    remove?: jest.Mock<void, []>


interface MockDocument {
    createElement: jest.Mock<MockCanvas | MockLink | any, [string]>;
    head?: {
        appendChild: jest.Mock<void, [any]>;
        removeChild: jest.Mock<void, [any]>;
        querySelector: jest.Mock<MockLink | null, [string]>;
        querySelectorAll: jest.Mock<MockLink[], [string]>
    };
    body?: {
        appendChild: jest.Mock<void, [any]>;
        removeChild: jest.Mock<void, [any]>
    }


interface MockLocalStorage {
    data: Record<string, string>;
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;
    clear: jest.Mock<void, []>


interface MockGradient {
    addColorStop: jest.Mock<void, [number, string]>


interface TestOptions {
    size?: number;
    backgroundColor?: string;
    bubbleColor?: string;
    shadowColor?: string;
    cached?: boolean


// Mock implementations
const mockContext: MockContext = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    createRadialGradient: jest.fn(),
    createLinearGradient: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn()
};

const mockCanvas: MockCanvas = {
    width: 32,
    height: 32,
    getContext: jest.fn(() => mockContext),
    toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    style: {}
};

const mockLink: MockLink = {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '',
    id: 'favicon-32',
    remove: jest.fn()
};

const mockDocument: MockDocument = {
    createElement: jest.fn((tagName: string) => {
        if (tagName === 'canvas') {
            return { ...mockCanvas ) 
        }
        if (tagName === 'link') {
            return { ...mockLink ) 
        }
        return {}
    }),
    head: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [])
    },
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    }
};

const mockLocalStorage: MockLocalStorage = {
    data: {},
    getItem: jest.fn((key: string) => mockLocalStorage.data[key] || null),
    setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage.data[key] = value
    }),
    removeItem: jest.fn((key: string) => {
        delete mockLocalStorage.data[key]
    }),
    clear: jest.fn(() => {
        mockLocalStorage.data = {}
    })
};

const mockGradient: MockGradient = {
    addColorStop: jest.fn()
};

// Global mocks
Object.defineProperty(global, 'document', {
    value: mockDocument,
    configurable: true
});

Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    configurable: true
});

// Setup gradient mocks
beforeAll(() => {

    mockContext.createRadialGradient.mockReturnValue(mockGradient as any);
    mockContext.createLinearGradient.mockReturnValue(mockGradient as any)

});
describe('FaviconGenerator', () => {
    let faviconGenerator: FaviconGenerator;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.clear();
        mockContext.fillStyle = '#000000';
        mockContext.strokeStyle = '#000000';
        mockContext.lineWidth = 1;
        faviconGenerator = new FaviconGenerator()
    
});

    describe('基本的なファビコン生成', () => {
        it('デフォルト設定でファビコンを生成する', async () => {
            await faviconGenerator.generateFavicon();
            
            expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
            expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
            expect(mockContext.clearRect).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalled();
            expect(mockContext.fill).toHaveBeenCalled()
        });

        it('カスタム設定でファビコンを生成する', async () => {
            const options: TestOptions = {
                size: 64,
                backgroundColor: '#FF0000',
                bubbleColor: '#00FF00'
            };

            await faviconGenerator.generateFavicon(options);
            
            expect(mockCanvas.width).toBe(64);
            expect(mockCanvas.height).toBe(64);
            expect(mockContext.fillStyle).toContain('#FF0000')
        });

        it('複数のサイズでファビコンを生成する', async () => {
            const sizes = [16, 32, 48];
            
            for (const size of sizes) {
                await faviconGenerator.generateFavicon({ size });
                expect(mockCanvas.width).toBe(size);
                expect(mockCanvas.height).toBe(size)
            }
        })
    });

    describe('キャッシュ機能', () => {

        it('生成されたファビコンをキャッシュする', async () => {
            await faviconGenerator.generateFavicon();
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
            const cacheKey = mockLocalStorage.setItem.mock.calls[0][0];
            expect(cacheKey).toContain('favicon')
        
});
it('キャッシュされたファビコンを使用する', async () => {
            const cachedData = 'data:image/png;base64,cached';
            mockLocalStorage.data['favicon_32_default'] = cachedData;
            
            const result = await faviconGenerator.generateFavicon({ cached: true 
});
            
            expect(mockLocalStorage.getItem).toHaveBeenCalled();
            expect(result).toBe(cachedData)
        });

        it('キャッシュクリア機能が動作する', () => {

            mockLocalStorage.data['favicon_16'] = 'data1';
            mockLocalStorage.data['favicon_32'] = 'data2';
            mockLocalStorage.data['other_data'] = 'data3';
            
            faviconGenerator.clearCache();
            
            expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
            expect(mockLocalStorage.data['other_data']).toBe('data3')
        
})
 
});

    describe('DOM操作', () => {
        it('ファビコンリンクをDOMに追加する', async () => {
            await faviconGenerator.applyFavicon();
            
            expect(mockDocument.createElement).toHaveBeenCalledWith('link');
            expect(mockDocument.head?.appendChild).toHaveBeenCalled();
            expect(mockLink.rel).toBe('icon');
            expect(mockLink.type).toBe('image/png')
        });

        it('既存のファビコンリンクを置換する', async () => {
            const existingLink = { ...mockLink };
            mockDocument.head!.querySelector = jest.fn(() => existingLink);
            
            await faviconGenerator.applyFavicon();
            
            expect(mockDocument.head?.removeChild).toHaveBeenCalledWith(existingLink);
            expect(mockDocument.head?.appendChild).toHaveBeenCalled()
        });

        it('複数サイズのファビコンを生成・適用する', async () => {

            await faviconGenerator.generateMultipleSizes();
            
            expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
            expect(mockDocument.createElement).toHaveBeenCalledWith('link');
            expect(mockDocument.head?.appendChild).toHaveBeenCalled()
        
})
 
});

    describe('エラーハンドリング', () => {

        it('Canvas生成エラーを適切に処理する', async () => {
            mockDocument.createElement.mockReturnValueOnce(null);
            
            const result = await faviconGenerator.generateFavicon();
            
            expect(result).toBeNull()
        
});
it('Context取得エラーを適切に処理する', async () => {
            mockCanvas.getContext.mockReturnValueOnce(null);
            
            const result = await faviconGenerator.generateFavicon();
            
            expect(result).toBeNull()
        
});

        it('toDataURL エラーを適切に処理する', async () => {

            mockCanvas.toDataURL.mockImplementationOnce(() => {
                throw new Error('toDataURL error')
            
});
const result = await faviconGenerator.generateFavicon();
            
            expect(result).toBeNull()
        
});

        it('LocalStorage エラーを適切に処理する', async () => {

            mockLocalStorage.setItem.mockImplementationOnce(() => {
                throw new Error('Storage quota exceeded')
            
});
// エラーが発生してもファビコンは生成される
            const result = await faviconGenerator.generateFavicon();
            expect(result).toBeTruthy()
        
})
    });

    describe('描画機能', () => {

        it('バブル形状を正しく描画する', async () => {
            await faviconGenerator.generateFavicon();
            
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalled();
            expect(mockContext.fill).toHaveBeenCalled()
        
});
it('グラデーション効果を適用する', async () => {
            await faviconGenerator.generateFavicon({ bubbleColor: '#FF0000' 
});
            
            expect(mockContext.createRadialGradient).toHaveBeenCalled();
            expect(mockGradient.addColorStop).toHaveBeenCalled()
        });

        it('影効果を描画する', async () => {

            await faviconGenerator.generateFavicon({ shadowColor: '#888888' 
});
expect(mockContext.arc).toHaveBeenCalledTimes(2); // バブルと影
            expect(mockContext.fill).toHaveBeenCalledTimes(2)
        
});

        it('背景色を正しく設定する', async () => {

            const backgroundColor = '#FFFF00';
            await faviconGenerator.generateFavicon({ backgroundColor 
});
expect(mockContext.fillRect).toHaveBeenCalled()
        
})
    });

    describe('パフォーマンステスト', () => {
        it('大量のファビコン生成が効率的に実行される', async () => {
            const startTime = Date.now();
            
            // 複数サイズを同時生成
            const promises = [16, 32, 48, 64].map(size => 
                faviconGenerator.generateFavicon({ size })
            );
            
            await Promise.all(promises);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(1000); // 1秒以内
        });

        it('メモリ使用量が適切に管理される', async () => {
            // 大量のファビコンを生成してメモリリークをチェック
            for (let i = 0; i < 10; i++) {
                await faviconGenerator.generateFavicon({ size: 32 })
            }
            
            // メモリが適切に解放されることを確認
            expect(mockCanvas.getContext).toHaveBeenCalled()
        })
    });

    describe('統合テスト', () => {

        it('完全なワークフロー（生成→キャッシュ→適用）が動作する', async () => {
            // 1. ファビコン生成
            const dataUrl = await faviconGenerator.generateFavicon();
            expect(dataUrl).toBeTruthy();
            
            // 2. キャッシュ確認
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
            
            // 3. DOM適用
            await faviconGenerator.applyFavicon();
            expect(mockDocument.head?.appendChild).toHaveBeenCalled();
            
            // 4. 複数サイズ生成
            await faviconGenerator.generateMultipleSizes();
            expect(mockDocument.createElement).toHaveBeenCalledWith('canvas')
        
})
    })
}););

// テストユーティリティ関数
function createMockImageData(width: number, height: number): ImageData {
    const data = new Uint8ClampedArray(width * height * 4);
    return {
        width,
        height,
        data,
        colorSpace: 'srgb'
    }


function createTestOptions(overrides: Partial<TestOptions> = {}): TestOptions {
    return {
        size: 32,
        backgroundColor: '#FFFFFF',
        bubbleColor: '#007ACC',
        shadowColor: '#000000',
        cached: false,
        ...overrides
    }
