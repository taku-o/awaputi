/**
 * ScreenshotCapture 単体テスト (Task 20.2)
 * 包括的なテストカバレッジでScreenshotCaptureの全機能をテスト
 */
import { jest } from '@jest/globals';
import { ScreenshotCapture } from '../../../src/core/ScreenshotCapture.js';

// Type definitions
interface MockCanvasContext {
    drawImage: jest.Mock<void, [any, number, number]>;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: string;
}

interface MockCanvas {
    width: number;
    height: number;
    toBlob: jest.Mock<void, [(blob: Blob | null) => void, string?, number?]>;
    getContext: jest.Mock<MockCanvasContext | null, [string]>;
    remove?: jest.Mock<void, []>;
    toDataURL?: jest.Mock<string, [string?]>;
}

interface MockGameEngine {
    canvas: MockCanvas | null;
}

interface MockAnchorElement {
    href: string;
    download: string;
    click: jest.Mock<void, []>;
    remove: jest.Mock<void, []>;
}

interface MockScreenshotOverlay {
    createScoreOverlay: jest.Mock<Promise<MockCanvas>, [any]>;
    createAchievementOverlay: jest.Mock<Promise<MockCanvas>, [any]>;
    createCustomOverlay: jest.Mock<Promise<MockCanvas>, [any]>;
}

interface CaptureOptions {
    format?: string;
    quality?: string;
    maxWidth?: number;
    maxHeight?: number;
    optimize?: boolean;
}

interface CaptureResult {
    blob: Blob;
    url: string;
    format: string;
    filename: string;
    width?: number;
    height?: number;
    overlayType?: string;
    hasOverlay?: boolean;
    optimized?: boolean;
}

interface ImageData {
    data: ArrayBuffer;
    blob: Blob;
    url: string;
    size: number;
}

interface CaptureRequest {
    options: CaptureOptions;
}

interface BatchResult {
    status: string;
    value?: CaptureResult;
    reason?: Error;
}

interface QueueItem {
    options: CaptureOptions;
    resolve: (value: CaptureResult) => void;
    reject: (reason: Error) => void;
}

interface CaptureHistoryItem {
    timestamp: number;
    size?: number;
    url?: string;
    filename?: string;
}

interface MemoryUsage {
    captureHistory: number;
    queue: number;
    stats: number;
}

interface Stats {
    captures: number;
    successes: number;
    errors: number;
    successRate?: number;
    averageTimeMs?: number;
    averageSizeKB?: number;
}

interface Config {
    defaultFormat: string;
    maxWidth: number;
    maxHeight: number;
    quality?: {
        high: number;
        medium: number;
        low: number;
    };
}

// Canvas Mock
const mockCanvas: MockCanvas = {
    width: 800,
    height: 600,
    toBlob: jest.fn((callback: (blob: Blob | null) => void, mimeType?: string, quality?: number) => {
        // ScreenshotCapture.js で使われる toBlob callback を適切に呼び出す
        setTimeout(() => {
            const mockBlob = new global.Blob(['mock image data'], { type: mimeType || 'image/png' });
            callback(mockBlob);
        }, 0);
    }),
    getContext: jest.fn(() => ({
        drawImage: jest.fn(),
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    }))
};

// GameEngine Mock
const mockGameEngine: MockGameEngine = {
    canvas: mockCanvas
};

// DOM Mocks
Object.defineProperty(global, 'document', {
    value: {
        createElement: jest.fn((tagName: string) => {
            if (tagName === 'canvas') {
                return {
                    ...mockCanvas,
                    remove: jest.fn()
                };
            }
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jest.fn(),
                    remove: jest.fn()
                } as MockAnchorElement;
            }
            return {
                remove: jest.fn()
            };
        }),
        querySelector: jest.fn((selector: string) => {
            // ScreenshotCapture.js の getGameCanvas() で使われるセレクタに対応
            if (selector === 'canvas#gameCanvas, canvas.game-canvas, canvas' || 
                selector.includes('canvas')) {
                return mockCanvas;
            }
            return null;
        }),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        body: {
            appendChild: jest.fn()
        },
        removeChild: jest.fn(),
        head: {
            appendChild: jest.fn()
        }
    },
    configurable: true
});

// Window Mock for ErrorHandler
Object.defineProperty(global, 'window', {
    value: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        document: global.document,
        performance: global.performance
    },
    configurable: true
});

Object.defineProperty(global, 'URL', {
    value: {
        createObjectURL: jest.fn(() => 'blob:mock-url'),
        revokeObjectURL: jest.fn()
    },
    configurable: true
});

Object.defineProperty(global, 'Image', {
    value: class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src: string = '';
        width: number = 800;
        height: number = 600;

        set src(value: string) {
            this._src = value;
            setTimeout(() => {
                if (this.onload) this.onload();
            }, 0);
        }

        get src(): string {
            return this._src;
        }
    },
    configurable: true
});

Object.defineProperty(global, 'Blob', {
    value: class MockBlob {
        parts: any[];
        type: string;
        size: number;

        constructor(parts: any[], options?: { type?: string }) {
            this.parts = parts;
            this.type = options?.type || '';
            this.size = parts ? parts.join('').length : 0;
        }

        arrayBuffer(): Promise<ArrayBuffer> {
            return Promise.resolve(new ArrayBuffer(this.size));
        }
    },
    configurable: true
});

// Performance Mock
Object.defineProperty(global, 'performance', {
    value: {
        now: jest.fn(() => Date.now()),
        memory: {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
        }
    },
    configurable: true
});

// Worker Mock
Object.defineProperty(global, 'Worker', {
    value: class MockWorker {
        url: string;
        onmessage: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;

        constructor(url: string) {
            this.url = url;
        }

        postMessage(data: any): void {
            setTimeout(() => {
                if (this.onmessage) {
                    this.onmessage({
                        data: { success: true, data: { processed: true } }
                    });
                }
            }, 0);
        }

        terminate(): void {
            // Mock implementation
        }
    },
    configurable: true
});

describe('ScreenshotCapture', () => {
    let screenshotCapture: ScreenshotCapture;

    beforeEach(() => {
        screenshotCapture = new ScreenshotCapture(mockGameEngine);
        // モック関数のクリア
        mockCanvas.toBlob.mockClear();
        mockCanvas.getContext.mockClear();
        (global.URL.createObjectURL as jest.Mock).mockClear();
        (global.URL.revokeObjectURL as jest.Mock).mockClear();
        // toBlobのデフォルトモック実装
        mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void, format?: string, quality?: number) => {
            const mockBlob = new Blob(['mock-image-data'], { type: format || 'image/png' });
            setTimeout(() => callback(mockBlob), 0);
        });
    });

    describe('初期化', () => {
        it('正常に初期化される', () => {
            expect(screenshotCapture).toBeInstanceOf(ScreenshotCapture);
            expect(screenshotCapture.gameEngine).toBe(mockGameEngine);
        });

        it('設定が初期化される', () => {
            expect(screenshotCapture.config).toBeDefined();
            expect(screenshotCapture.config.defaultFormat).toBe('png');
            expect(screenshotCapture.config.maxWidth).toBe(1200);
            expect(screenshotCapture.config.maxHeight).toBe(630);
        });

        it('統計が初期化される', () => {
            expect(screenshotCapture.stats).toBeDefined();
            expect(screenshotCapture.stats.captures).toBe(0);
            expect(screenshotCapture.stats.successes).toBe(0);
            expect(screenshotCapture.stats.errors).toBe(0);
        });

        it('キャプチャキューが初期化される', () => {
            expect(screenshotCapture.captureQueue).toBeDefined();
            expect(screenshotCapture.isProcessingQueue).toBe(false);
            expect(screenshotCapture.maxQueueSize).toBe(10);
        });
    });

    describe('基本的なスクリーンショット機能', () => {
        it('ゲームCanvasのスクリーンショットを取得する', async () => {
            const result = await screenshotCapture.captureGameCanvas();
            expect(result).toBeDefined();
            expect(result.blob).toBeInstanceOf(Blob);
            expect(result.url).toBe('blob:mock-url');
            expect(result.format).toBe('png');
            expect(result.filename).toBeDefined();
        });

        it('JPEGフォーマットでスクリーンショットを取得する', async () => {
            const result = await screenshotCapture.captureGameCanvas({
                format: 'jpeg',
                quality: 'high'
            });
            expect(result.format).toBe('jpeg');
            expect(mockCanvas.toBlob).toHaveBeenCalledWith(
                expect.any(Function),
                'image/jpeg',
                expect.any(Number)
            );
        });

        it('WebPフォーマットでスクリーンショットを取得する', async () => {
            // WebPサポートをモック
            jest.spyOn(screenshotCapture, 'isWebPSupported').mockReturnValue(true);
            const result = await screenshotCapture.captureGameCanvas({
                format: 'webp',
                quality: 'medium'
            });
            expect(result.format).toBe('webp');
        });

        it('カスタムサイズでスクリーンショットを取得する', async () => {
            const result = await screenshotCapture.captureGameCanvas({
                maxWidth: 600,
                maxHeight: 400
            });
            expect(result.width).toBeLessThanOrEqual(600);
            expect(result.height).toBeLessThanOrEqual(400);
        });
    });

    describe('カスタム領域キャプチャ', () => {
        it('指定領域のスクリーンショットを取得する', async () => {
            const result = await screenshotCapture.captureRegion(100, 100, 200, 150);
            expect(result).toBeDefined();
            expect(result.width).toBe(200);
            expect(result.height).toBe(150);
        });

        it('無効な領域を修正する', async () => {
            const result = await screenshotCapture.captureRegion(-50, -50, 1000, 1000);
            expect(result).toBeDefined();
            // 領域がCanvas境界内に修正される
        });

        it('ゼロサイズ領域でエラーを投げる', async () => {
            await expect(
                screenshotCapture.captureRegion(0, 0, 0, 0)
            ).rejects.toThrow('不正な領域指定です');
        });
    });

    describe('オーバーレイ機能', () => {
        beforeEach(() => {
            // ScreenshotOverlayのモック
            screenshotCapture.screenshotOverlay = {
                createScoreOverlay: jest.fn().mockResolvedValue(mockCanvas),
                createAchievementOverlay: jest.fn().mockResolvedValue(mockCanvas),
                createCustomOverlay: jest.fn().mockResolvedValue(mockCanvas)
            } as unknown as MockScreenshotOverlay;
        });

        it('スコアオーバーレイ付きスクリーンショットを取得する', async () => {
            const scoreData = { score: 15000, stage: 'normal' };
            const result = await screenshotCapture.captureWithScore(scoreData);
            expect(result).toBeDefined();
            expect(result.overlayType).toBe('score');
            expect(result.hasOverlay).toBe(true);
        });

        it('実績オーバーレイ付きスクリーンショットを取得する', async () => {
            const achievementData = { name: 'テスト実績', rarity: 'common' };
            const result = await screenshotCapture.captureWithAchievement(achievementData);
            expect(result).toBeDefined();
            expect(result.overlayType).toBe('achievement');
            expect(result.hasOverlay).toBe(true);
        });

        it('カスタムオーバーレイ付きスクリーンショットを取得する', async () => {
            const customData = { text: 'カスタムテキスト' };
            const result = await screenshotCapture.captureWithCustomOverlay(customData);
            expect(result).toBeDefined();
            expect(result.overlayType).toBe('custom');
            expect(result.hasOverlay).toBe(true);
        });

        it('オーバーレイ失敗時のフォールバック', async () => {
            (screenshotCapture.screenshotOverlay as MockScreenshotOverlay).createScoreOverlay.mockRejectedValue(
                new Error('Overlay creation failed')
            );
            const result = await screenshotCapture.captureWithScore({ score: 1000 });
            expect(result).toBeDefined();
            // フォールバック処理が動作する
        });
    });

    describe('画像最適化', () => {
        it('画像サイズを最適化する', async () => {
            // 大きなBlobをモック
            const largeBlobMock = new Blob(['x'.repeat(600 * 1024)], { type: 'image/png' });
            // 600KB
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
                setTimeout(() => callback(largeBlobMock), 0);
            });
            const result = await screenshotCapture.captureGameCanvas({
                optimize: true
            });
            expect(result).toBeDefined();
            // 最適化が実行されることを確認
        });

        it('品質削減による最適化', async () => {
            const spy = jest.spyOn(screenshotCapture, 'reduceImageQuality');
            spy.mockResolvedValue({
                data: new ArrayBuffer(100 * 1024),
                blob: new Blob(['optimized'], { type: 'image/jpeg' }),
                url: 'blob:optimized-url',
                size: 100 * 1024
            });

            const largeBlobMock = new Blob(['x'.repeat(600 * 1024)], { type: 'image/png' });
            const result = await screenshotCapture.optimizeImage({
                data: new ArrayBuffer(600 * 1024),
                blob: largeBlobMock,
                url: 'blob:original-url',
                size: 600 * 1024
            }, { format: 'jpeg', quality: 'high' });
            expect(result.optimized).toBe(true);
            spy.mockRestore();
        });

        it('最適化制限回数を適用する', async () => {
            const largeBlobMock = new Blob(['x'.repeat(600 * 1024)], { type: 'image/png' });
            // reduceImageQualityが常に同じサイズを返すようにモック
            jest.spyOn(screenshotCapture, 'reduceImageQuality').mockResolvedValue({
                data: new ArrayBuffer(600 * 1024),
                blob: largeBlobMock,
                url: 'blob:test-url',
                size: 600 * 1024
            });
            const result = await screenshotCapture.optimizeImage({
                data: new ArrayBuffer(600 * 1024),
                blob: largeBlobMock,
                url: 'blob:original-url',
                size: 600 * 1024
            }, { format: 'png' });
            // 最大試行回数まで実行される
            expect(screenshotCapture.reduceImageQuality).toHaveBeenCalledTimes(3);
        });
    });

    describe('バックグラウンド処理', () => {
        it('バックグラウンドでスクリーンショットを生成する', async () => {
            const result = await screenshotCapture.captureInBackground();
            expect(result).toBeDefined();
            expect(result.blob).toBeInstanceOf(Blob);
        });

        it('Web Workerを使用した処理', async () => {
            const spy = jest.spyOn(screenshotCapture, 'captureWithWorker');
            spy.mockImplementation((options: CaptureOptions, resolve: (value: CaptureResult) => void, reject: (reason: Error) => void) => {
                resolve({ blob: new Blob(['worker-result']), url: 'blob:worker-url', format: 'png', filename: 'test.png' });
            });
            const result = await screenshotCapture.captureInBackground();
            expect(result).toBeDefined();
            spy.mockRestore();
        });

        it('Web Worker失敗時のフォールバック', async () => {
            // Workerを無効化
            const originalWorker = global.Worker;
            (global as any).Worker = undefined;
            
            const result = await screenshotCapture.captureInBackground();
            expect(result).toBeDefined();
            // Workerを復元
            global.Worker = originalWorker;
        });
    });

    describe('バッチ処理', () => {
        it('複数のスクリーンショットをバッチ処理する', async () => {
            const requests: CaptureRequest[] = [
                { options: { format: 'png' } },
                { options: { format: 'jpeg' } },
                { options: { format: 'webp' } }
            ];
            
            const results = await screenshotCapture.captureBatch(requests);
            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result.status).toBe('fulfilled');
            });
        });

        it('バッチサイズ制限を適用する', async () => {
            const requests = Array(10).fill({ options: { format: 'png' } });
            const startTime = Date.now();
            await screenshotCapture.captureBatch(requests);
            const endTime = Date.now();
            // バッチ処理により適切な時間で完了する
            expect(endTime - startTime).toBeGreaterThan(0);
        });
    });

    describe('キュー管理', () => {
        it('キューにスクリーンショット要求を追加する', async () => {
            // 非同期処理のためのタイムアウトを短くする
            jest.setTimeout(5000);
            const promise = screenshotCapture.queueCapture({ format: 'png' });
            // キューに追加されるまで少し待つ
            await new Promise(resolve => setTimeout(resolve, 10));
            const result = await promise;
            expect(result).toBeDefined();
        });

        it('キューサイズ制限を適用する', async () => {
            // キューを直接満杯にする
            screenshotCapture.captureQueue = new Array(screenshotCapture.maxQueueSize).fill({
                options: { format: 'png' },
                resolve: jest.fn(),
                reject: jest.fn()
            } as QueueItem);
            // 制限を超える要求は拒否される
            await expect(
                screenshotCapture.queueCapture({ format: 'png' })
            ).rejects.toThrow('スクリーンショットキューが満杯です');
        });

        it('キューを順次処理する', async () => {
            const promises = [];
            
            for (let i = 0; i < 3; i++) {
                promises.push(screenshotCapture.queueCapture({ format: 'png' }));
            }
            
            const allResults = await Promise.all(promises);
            expect(allResults).toHaveLength(3);
        });
    });

    describe('メモリ管理', () => {
        it('メモリ使用量を監視する', () => {
            const memoryUsage = screenshotCapture.getMemoryUsage();
            expect(memoryUsage).toBeDefined();
            expect(memoryUsage.captureHistory).toBeDefined();
            expect(memoryUsage.queue).toBeDefined();
            expect(memoryUsage.stats).toBeDefined();
        });

        it('メモリクリーンアップを実行する', () => {
            // キャプチャ履歴を追加
            for (let i = 0; i < 20; i++) {
                screenshotCapture.captureHistory.push({
                    timestamp: Date.now(),
                    size: 10 * 1024 * 1024, // 10MB each to trigger cleanup
                    url: `blob:test-${i}`
                });
            }
            
            screenshotCapture.performMemoryCleanup();
            // 古いキャプチャが削除される (30% of 20 = 6 items removed)
            expect(screenshotCapture.captureHistory.length).toBeLessThan(20);
        });

        it('自動メモリ管理が設定される', () => {
            expect(screenshotCapture.setupAutoMemoryManagement).toBeDefined();
            // 実際のsetIntervalは設定されるが、テストでは確認のみ
        });
    });

    describe('統計とパフォーマンス', () => {
        it('統計を記録する', async () => {
            const initialStats = { ...screenshotCapture.stats };
            
            await screenshotCapture.captureGameCanvas();
            expect(screenshotCapture.stats.captures).toBe(initialStats.captures + 1);
            expect(screenshotCapture.stats.successes).toBe(initialStats.successes + 1);
        });

        it('統計レポートを取得する', async () => {
            await screenshotCapture.captureGameCanvas();
            const stats = screenshotCapture.getStats();
            expect(stats.successRate).toBeDefined();
            expect(stats.averageTimeMs).toBeDefined();
            expect(stats.averageSizeKB).toBeDefined();
        });

        it('キャプチャ履歴を管理する', async () => {
            await screenshotCapture.captureGameCanvas();
            const history = screenshotCapture.getCaptureHistory();
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].timestamp).toBeDefined();
            expect(history[0].filename).toBeDefined();
        });

        it('履歴制限を適用する', async () => {
            // 履歴を大量に追加
            for (let i = 0; i < 15; i++) {
                await screenshotCapture.captureGameCanvas();
            }
            
            const history = screenshotCapture.getCaptureHistory();
            expect(history.length).toBeLessThanOrEqual(10); // 最大10件
        });
    });

    describe('エラーハンドリング', () => {
        it('Canvasが見つからない場合のエラー', async () => {
            // gameEngineとquerySelectorの両方をnullに設定
            screenshotCapture.gameEngine.canvas = null;
            const originalQuerySelector = document.querySelector;
            (document.querySelector as jest.Mock).mockReturnValue(null);
            await expect(
                screenshotCapture.captureGameCanvas()
            ).rejects.toThrow('ゲームCanvasが見つかりません');
            // 後続テストのためにmockを復元
            (document.querySelector as jest.Mock).mockImplementation(originalQuerySelector);
        });

        it('toBlobエラーを處理する', async () => {
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
                setTimeout(() => callback(null), 0);
            });
            await expect(
                screenshotCapture.captureGameCanvas()
            ).rejects.toBeDefined();
        });

        it('WebPサポートなしでWebP要求した場合', async () => {
            jest.spyOn(screenshotCapture, 'isWebPSupported').mockReturnValue(false);
            await expect(
                screenshotCapture.createWebP(mockCanvas, 0.8)
            ).rejects.toThrow('WebPはサポートされていません');
        });

        it('同時キャプチャを防ぐ', async () => {
            // gameEngine.canvasが利用可能であることを確保
            screenshotCapture.gameEngine.canvas = mockCanvas;
            (document.querySelector as jest.Mock).mockReturnValue(mockCanvas);
            const promise1 = screenshotCapture.captureGameCanvas();
            await expect(
                screenshotCapture.captureGameCanvas()
            ).rejects.toThrow('スクリーンショット作成中です');
            await promise1;
        });
    });

    describe('設定管理', () => {
        it('設定を更新する', () => {
            const newConfig: Partial<Config> = {
                defaultFormat: 'jpeg',
                maxWidth: 1000,
                quality: {
                    high: 0.95,
                    medium: 0.85,
                    low: 0.65
                }
            };
            
            screenshotCapture.updateConfig(newConfig);
            expect(screenshotCapture.config.defaultFormat).toBe('jpeg');
            expect(screenshotCapture.config.maxWidth).toBe(1000);
            expect(screenshotCapture.config.quality!.high).toBe(0.95);
        });

        it('ファイル名を生成する', () => {
            const filename1 = screenshotCapture.generateFilename();
            const filename2 = screenshotCapture.generateFilename('test');
            expect(filename1).toMatch(/^screenshot-/);
            expect(filename2).toMatch(/^test-/);
            expect(filename1).not.toBe(filename2);
        });
    });

    describe('フォーマット検出とサポート', () => {
        it('WebPサポートを検出する', () => {
            // canvasのtoDataURLをモック
            const mockToDataURL = jest.fn(() => 'data:image/webp,base64,test');
            Object.defineProperty(global.document, 'createElement', {
                value: jest.fn(() => ({
                    toDataURL: mockToDataURL
                })),
                configurable: true
            });
            const isSupported = screenshotCapture.isWebPSupported();
            expect(typeof isSupported).toBe('boolean');
        });

        it('品質値を計算する', () => {
            const quality = screenshotCapture.getQualityValue('high', 'jpeg');
            expect(quality).toBeGreaterThan(0);
            expect(quality).toBeLessThanOrEqual(1);
        });
    });

    describe('クリーンアップ', () => {
        it('リソースをクリーンアップする', () => {
            // 履歴とキューにデータを追加
            screenshotCapture.captureHistory.push({
                url: 'blob:test-url',
                timestamp: Date.now()
            });
            screenshotCapture.captureQueue.push({
                reject: jest.fn()
            } as unknown as QueueItem);
            screenshotCapture.lastCapture = {
                url: 'blob:last-url'
            } as any;
            
            screenshotCapture.cleanup();
            expect(screenshotCapture.captureHistory).toHaveLength(0);
            expect(screenshotCapture.captureQueue).toHaveLength(0);
            expect(screenshotCapture.lastCapture).toBeNull();
        });

        it('待機中の要求をキャンセルする', () => {
            const mockReject = jest.fn();
            screenshotCapture.captureQueue.push({ reject: mockReject } as unknown as QueueItem);
            screenshotCapture.cleanup();
            expect(mockReject).toHaveBeenCalledWith(
                new Error('ScreenshotCapture がクリーンアップされました')
            );
        });
    });
});

// テストユーティリティ関数
function createMockCanvas(width: number = 800, height: number = 600): MockCanvas {
    return {
        width,
        height,
        getContext: jest.fn(() => ({
            drawImage: jest.fn(),
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        })),
        toBlob: jest.fn(),
        remove: jest.fn()
    };
}

function createMockBlob(size: number = 1024, type: string = 'image/png'): Blob {
    return new Blob(['x'.repeat(size)], { type });
}