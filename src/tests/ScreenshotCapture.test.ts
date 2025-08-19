/**
 * スクリーンショット機能テスト (Task 5)
 */

import { jest } from '@jest/globals';

// モック用の型定義
interface MockContext {
    drawImage: jest.Mock;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: string;
}

interface MockCanvas {
    width: number;
    height: number;
    getContext: jest.Mock<MockContext>;
    toBlob: jest.Mock;
    toDataURL: jest.Mock<string>;
    remove: jest.Mock;
}

interface MockGameEngine {
    canvas: MockCanvas | null;
}

interface ScreenshotResult {
    data: ArrayBuffer;
    blob: Blob;
    url: string;
    format: string;
    width: number;
    height: number;
    size?: number;
    optimized?: boolean;
    originalSize?: number;
}

interface CaptureOptions {
    format?: string;
    quality?: string;
    maxWidth?: number;
    maxHeight?: number;
}

interface CaptureHistoryItem {
    timestamp: number;
    filename: string;
    format: string;
    size: number;
    url?: string;
}

interface CaptureStats {
    captures: number;
    successes: number;
    errors: number;
    successRate: number;
    averageTimeMs?: number;
}

interface ImageData {
    data: ArrayBuffer;
    blob: Blob;
    url: string;
    size: number;
    optimized: boolean;
    originalSize?: number;
}

// MockImage クラスの定義
class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private _src: string = '';
    
    constructor() {
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 0);
    }
    
    set src(value: string) {
        this._src = value;
    }
    
    get src(): string {
        return this._src;
    }
    
    get width(): number { return 800; }
    get height(): number { return 600; }
}

// ScreenshotCapture の型定義（必要な部分のみ）
interface ScreenshotCapture {
    gameEngine: MockGameEngine;
    config: any;
    stats: any;
    captureHistory: CaptureHistoryItem[];
    capturing?: boolean;
    lastCapture?: { url: string } | null;
    
    cleanup: () => void;
    captureGameCanvas: (options?: CaptureOptions) => Promise<ScreenshotResult>;
    captureRegion: (x: number, y: number, width: number, height: number) => Promise<ScreenshotResult>;
    isWebPSupported: () => boolean;
    getCaptureHistory: () => CaptureHistoryItem[];
    getStats: () => CaptureStats;
    optimizeImage: (imageData: ImageData, options: CaptureOptions) => Promise<ImageData>;
    createPNG: (canvas: MockCanvas) => Promise<ScreenshotResult>;
    createJPEG: (canvas: MockCanvas, quality: number) => Promise<ScreenshotResult>;
    createWebP: (canvas: MockCanvas, quality: number) => Promise<ScreenshotResult>;
    generateFilename: (prefix?: string) => string;
    getQualityValue: (quality: string, format: string) => number;
    getGameCanvas: () => MockCanvas | null;
    updateConfig: (newConfig: any) => void;
    clearHistory: () => void;
}

describe('ScreenshotCapture', () => {
    let screenshotCapture: ScreenshotCapture;
    let mockGameEngine: MockGameEngine;
    let mockCanvas: MockCanvas;
    let mockContext: MockContext;
    
    beforeEach(async () => {
        // Canvas APIのモック
        mockContext = {
            drawImage: jest.fn(),
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        };
        
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: jest.fn<MockContext>().mockReturnValue(mockContext),
            toBlob: jest.fn(),
            toDataURL: jest.fn<string>().mockReturnValue('data:image/png;base64,mock'),
            remove: jest.fn()
        };
        
        // document.createElement のモック
        document.createElement = jest.fn().mockImplementation((tagName: string) => {
            if (tagName === 'canvas') {
                return { ...mockCanvas };
            }
            return {};
        });
        
        // GameEngineのモック
        mockGameEngine = {
            canvas: mockCanvas
        };
        
        // URLのモック
        global.URL = {
            createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
            revokeObjectURL: jest.fn()
        } as any;
        
        // Imageのモック
        global.Image = MockImage as any;
        
        const { ScreenshotCapture } = await import('../core/ScreenshotCapture.ts');
        screenshotCapture = new ScreenshotCapture(mockGameEngine);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        screenshotCapture.cleanup();
    });
    
    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(screenshotCapture.gameEngine).toBe(mockGameEngine);
            expect(screenshotCapture.config).toBeDefined();
            expect(screenshotCapture.stats).toBeDefined();
            expect(screenshotCapture.captureHistory).toEqual([]);
        });
        
        test('設定が正しく初期化される', () => {
            expect(screenshotCapture.config.defaultFormat).toBe('png');
            expect(screenshotCapture.config.maxWidth).toBe(1200);
            expect(screenshotCapture.config.maxHeight).toBe(630);
            expect(screenshotCapture.config.optimization.enabled).toBe(true);
        });
    });
    
    describe('ゲームCanvasキャプチャ', () => {
        beforeEach(() => {
            // toBlob のモック設定
            mockCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void, type?: string, quality?: number) => {
                const mockBlob = new Blob(['mock-image-data'], { 
                    type: type || 'image/png' 
                });
                Object.defineProperty(mockBlob, 'size', { value: 1024 });
                callback(mockBlob);
            });
        });
        
        test('基本的なスクリーンショットが作成される', async () => {
            const result = await screenshotCapture.captureGameCanvas();
            
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('blob');
            expect(result).toHaveProperty('url');
            expect(result.format).toBe('png');
            expect(result.width).toBe(800);
            expect(result.height).toBe(600);
        });
        
        test('JPEG形式でキャプチャできる', async () => {
            const result = await screenshotCapture.captureGameCanvas({ 
                format: 'jpeg',
                quality: 'medium'
            });
            
            expect(result.format).toBe('jpeg');
            expect(mockCanvas.toBlob).toHaveBeenCalledWith(
                expect.any(Function),
                'image/jpeg',
                expect.any(Number)
            );
        });
        
        test('カスタムサイズでキャプチャできる', async () => {
            const result = await screenshotCapture.captureGameCanvas({
                maxWidth: 400,
                maxHeight: 300
            });
            
            // リサイズされたキャンバスが作成されることを確認
            expect(document.createElement).toHaveBeenCalledWith('canvas');
        });
        
        test('WebP形式の対応確認', () => {
            const isSupported = screenshotCapture.isWebPSupported();
            expect(typeof isSupported).toBe('boolean');
        });
        
        test('キャプチャ履歴が記録される', async () => {
            await screenshotCapture.captureGameCanvas();
            
            const history = screenshotCapture.getCaptureHistory();
            expect(history).toHaveLength(1);
            expect(history[0]).toHaveProperty('timestamp');
            expect(history[0]).toHaveProperty('filename');
            expect(history[0]).toHaveProperty('format');
            expect(history[0]).toHaveProperty('size');
        });
        
        test('統計が正しく更新される', async () => {
            await screenshotCapture.captureGameCanvas();
            
            const stats = screenshotCapture.getStats();
            expect(stats.captures).toBe(1);
            expect(stats.successes).toBe(1);
            expect(stats.errors).toBe(0);
            expect(stats.successRate).toBe(100);
        });
    });
    
    describe('領域キャプチャ', () => {
        beforeEach(() => {
            mockCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void) => {
                const mockBlob = new Blob(['mock-region-data'], { type: 'image/png' });
                Object.defineProperty(mockBlob, 'size', { value: 512 });
                callback(mockBlob);
            });
        });
        
        test('指定領域のキャプチャができる', async () => {
            const result = await screenshotCapture.captureRegion(100, 100, 200, 150);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockCanvas, 100, 100, 200, 150, 0, 0, 200, 150
            );
            expect(result.width).toBe(200);
            expect(result.height).toBe(150);
        });
        
        test('不正な領域指定でエラーハンドリング', async () => {
            await expect(screenshotCapture.captureRegion(-10, -10, 0, 0))
                .rejects.toThrow('不正な領域指定です');
        });
        
        test('Canvas境界を超える領域の調整', async () => {
            const result = await screenshotCapture.captureRegion(700, 500, 200, 200);
            
            // Canvas境界内に調整されることを確認
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockCanvas, 700, 500, 100, 100, 0, 0, 100, 100
            );
        });
    });
    
    describe('画像最適化', () => {
        let mockImageData: ImageData;
        
        beforeEach(() => {
            mockImageData = {
                data: new ArrayBuffer(1024 * 600), // 600KB
                blob: new Blob(['large-image'], { type: 'image/png' }),
                url: 'blob:mock-large-url',
                size: 1024 * 600,
                optimized: false
            };
            
            Object.defineProperty(mockImageData.blob, 'size', { value: 1024 * 600 });
        });
        
        test('ターゲットサイズ以下の画像は最適化されない', async () => {
            const smallImageData = { ...mockImageData, size: 1024 * 100 }; // 100KB
            const result = await screenshotCapture.optimizeImage(smallImageData, { format: 'png' });
            
            expect(result.optimized).toBeFalsy();
            expect(result.size).toBe(1024 * 100);
        });
        
        test('大きな画像の最適化が実行される', async () => {
            // 最適化用のmockCanvasとmockContextを設定
            const optimizeCanvas = { ...mockCanvas };
            optimizeCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void) => {
                const optimizedBlob = new Blob(['optimized-image'], { type: 'image/png' });
                Object.defineProperty(optimizedBlob, 'size', { value: 1024 * 300 }); // 300KB
                callback(optimizedBlob);
            });
            
            document.createElement = jest.fn().mockReturnValue(optimizeCanvas);
            
            const result = await screenshotCapture.optimizeImage(mockImageData, { 
                format: 'png',
                quality: 'medium'
            });
            
            expect(result.optimized).toBe(true);
            expect(result.originalSize).toBe(1024 * 600);
        });
    });
    
    describe('画像フォーマット変換', () => {
        test('PNG画像が作成される', async () => {
            mockCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void, type?: string) => {
                expect(type).toBe('image/png');
                callback(new Blob(['png-data'], { type: 'image/png' }));
            });
            
            const result = await screenshotCapture.createPNG(mockCanvas);
            
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('blob');
            expect(result).toHaveProperty('url');
        });
        
        test('JPEG画像が作成される', async () => {
            mockCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void, type?: string, quality?: number) => {
                expect(type).toBe('image/jpeg');
                expect(typeof quality).toBe('number');
                callback(new Blob(['jpeg-data'], { type: 'image/jpeg' }));
            });
            
            const result = await screenshotCapture.createJPEG(mockCanvas, 0.8);
            
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('blob');
        });
        
        test('WebP画像の作成（対応時）', async () => {
            // WebPサポートのモック
            mockCanvas.toDataURL = jest.fn<string>().mockReturnValue('data:image/webp;base64,mock');
            mockCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void, type?: string, quality?: number) => {
                expect(type).toBe('image/webp');
                callback(new Blob(['webp-data'], { type: 'image/webp' }));
            });
            
            const result = await screenshotCapture.createWebP(mockCanvas, 0.8);
            
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('blob');
        });
        
        test('WebP非対応時のエラーハンドリング', async () => {
            // WebP非対応のモック
            mockCanvas.toDataURL = jest.fn<string>().mockReturnValue('data:image/png;base64,mock');
            
            await expect(screenshotCapture.createWebP(mockCanvas, 0.8))
                .rejects.toThrow('WebPはサポートされていません');
        });
    });
    
    describe('ユーティリティ機能', () => {
        test('ファイル名が正しく生成される', () => {
            const filename1 = screenshotCapture.generateFilename();
            const filename2 = screenshotCapture.generateFilename('custom');
            
            expect(filename1).toContain('screenshot-');
            expect(filename2).toContain('custom-');
            expect(filename1).not.toBe(filename2);
        });
        
        test('品質値が正しく計算される', () => {
            const pngQuality = screenshotCapture.getQualityValue('high', 'png');
            const jpegQuality = screenshotCapture.getQualityValue('medium', 'jpeg');
            
            expect(typeof pngQuality).toBe('number');
            expect(typeof jpegQuality).toBe('number');
            expect(jpegQuality).toBeLessThanOrEqual(1.0);
        });
        
        test('ゲームCanvasが正しく取得される', () => {
            const canvas = screenshotCapture.getGameCanvas();
            expect(canvas).toBe(mockCanvas);
        });
        
        test('設定の更新ができる', () => {
            const newConfig = { maxWidth: 1000, quality: { high: 0.95 } };
            screenshotCapture.updateConfig(newConfig);
            
            expect(screenshotCapture.config.maxWidth).toBe(1000);
            expect(screenshotCapture.config.quality.high).toBe(0.95);
        });
    });
    
    describe('エラーハンドリング', () => {
        test('Canvas取得失敗時のエラー', async () => {
            screenshotCapture.gameEngine.canvas = null;
            
            await expect(screenshotCapture.captureGameCanvas())
                .rejects.toThrow('ゲームCanvasが見つかりません');
        });
        
        test('重複キャプチャの防止', async () => {
            screenshotCapture.capturing = true;
            
            await expect(screenshotCapture.captureGameCanvas())
                .rejects.toThrow('スクリーンショット作成中です');
        });
        
        test('Blob作成失敗時のエラー処理', async () => {
            mockCanvas.toBlob = jest.fn().mockImplementation((callback: (blob: Blob | null) => void) => {
                callback(null);
            });
            
            await expect(screenshotCapture.captureGameCanvas())
                .rejects.toThrow();
        });
    });
    
    describe('パフォーマンスとメモリ管理', () => {
        test('キャプチャ履歴の制限', async () => {
            // 15回キャプチャして履歴が10個に制限されることを確認
            for (let i = 0; i < 15; i++) {
                await screenshotCapture.captureGameCanvas();
            }
            
            const history = screenshotCapture.getCaptureHistory();
            expect(history).toHaveLength(10);
        });
        
        test('履歴クリア機能', async () => {
            await screenshotCapture.captureGameCanvas();
            expect(screenshotCapture.getCaptureHistory()).toHaveLength(1);
            
            screenshotCapture.clearHistory();
            expect(screenshotCapture.getCaptureHistory()).toHaveLength(0);
            expect(URL.revokeObjectURL).toHaveBeenCalled();
        });
        
        test('クリーンアップ機能', () => {
            screenshotCapture.lastCapture = { url: 'blob:test-url' };
            screenshotCapture.cleanup();
            
            expect(screenshotCapture.lastCapture).toBeNull();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
        });
    });
    
    describe('統計機能', () => {
        test('成功統計の記録', async () => {
            await screenshotCapture.captureGameCanvas();
            await screenshotCapture.captureGameCanvas();
            
            const stats = screenshotCapture.getStats();
            expect(stats.captures).toBe(2);
            expect(stats.successes).toBe(2);
            expect(stats.successRate).toBe(100);
            expect(stats.averageTimeMs).toBeGreaterThan(0);
        });
        
        test('エラー統計の記録', async () => {
            screenshotCapture.gameEngine.canvas = null;
            
            try {
                await screenshotCapture.captureGameCanvas();
            } catch (error) {
                // エラーは期待される
            }
            
            const stats = screenshotCapture.getStats();
            expect(stats.captures).toBe(1);
            expect(stats.errors).toBe(1);
            expect(stats.successRate).toBe(0);
        });
    });
});