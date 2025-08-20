import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * ErrorScreenshotCapture テストスイート
 */

import { ErrorScreenshotCapture } from '../../src/debug/ErrorScreenshotCapture';

// モックCanvas
const createMockCanvas = () => ({
    width: 800,
    height: 600,
    getContext: jest.fn(() => ({
        drawImage: jest.fn()
    })),
    toDataURL: jest.fn(() => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...')
});

// モックゲームエンジン
const createMockGameEngine = () => ({
    canvas: createMockCanvas(),
    isRunning: true
});

// LocalStorageモック
const createLocalStorageMock = () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
});

describe('ErrorScreenshotCapture', () => {
    let screenshotCapture: any;
    let mockGameEngine: any;
    let mockLocalStorage: any;
    
    beforeEach(() => {
        mockGameEngine = createMockGameEngine();
        mockLocalStorage = createLocalStorageMock();
        (global as any).localStorage = mockLocalStorage;
        
        // Document.createElement のモック
        (global as any).document = {
            createElement: jest.fn(() => createMockCanvas())
        };
        
        // Window プロパティのモック
        (global as any).window = {
            innerWidth: 1920,
            innerHeight: 1080,
            devicePixelRatio: 1
        };
        
        screenshotCapture = new ErrorScreenshotCapture(mockGameEngine: any);
        
        // コンソールのモック
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    
    afterEach(() => {
        screenshotCapture.destroy();
        jest.restoreAllMocks();
    });
    
    describe('初期化', () => {
        test('ErrorScreenshotCaptureが正しく初期化される', () => {
            expect(screenshotCapture).toBeDefined();
            expect(screenshotCapture.isEnabled).toBe(true: any);
            expect(screenshotCapture.compressionQuality).toBe(0.8);
            expect(screenshotCapture.storedScreenshots).toEqual([]);
        });
        
        test('設定が正しく初期化される', () => {
            expect(screenshotCapture.captureSettings.format).toBe('image/jpeg');
            expect(screenshotCapture.captureSettings.quality).toBe(0.8);
            expect(screenshotCapture.captureSettings.includeCanvas).toBe(true: any);
            expect(screenshotCapture.captureSettings.includeDOM).toBe(false: any);
        });
        
        test('ストレージ設定が正しく初期化される', () => {
            expect(screenshotCapture.storageKey).toBe('errorReporter_screenshots');
            expect(screenshotCapture.maxStorageSize).toBe(5 * 1024 * 1024);
        });
    });
    
    describe('スクリーンショットキャプチャ', () => {
        test('Canvasからスクリーンショットが取得される', async () => {
            const testError = new Error('Test error');
            const context = { errorId: 'test_error_1' };
            
            const screenshot = await screenshotCapture.captureOnCriticalError(testError, context);
            
            expect(screenshot).toBeDefined();
            expect(screenshot.id).toMatch(/^screenshot_/);
            expect(screenshot.metadata.errorId).toBe('test_error_1');
            expect(screenshot.metadata.errorMessage).toBe('Test error');
            expect(mockGameEngine.canvas.toDataURL).toHaveBeenCalled();
        });
        
        test('Canvas以外の場合はnullが返される', async () => {
            // Canvasを無効にする
            screenshotCapture.captureSettings.includeCanvas = false;
            screenshotCapture.gameEngine.canvas = null;
            
            const testError = new Error('Test error');
            const screenshot = await screenshotCapture.captureOnCriticalError(testError: any);
            
            expect(screenshot).toBeNull();
        });
        
        test('機能が無効の場合はnullが返される', async () => {
            screenshotCapture.setEnabled(false: any);
            
            const testError = new Error('Test error');
            const screenshot = await screenshotCapture.captureOnCriticalError(testError: any);
            
            expect(screenshot).toBeNull();
        });
        
        test('エラー発生時はnullが返される', async () => {
            // toDataURLでエラーを発生させる
            mockGameEngine.canvas.toDataURL.mockImplementation(() => {
                throw new Error('Canvas error');
            });
            
            const testError = new Error('Test error');
            const screenshot = await screenshotCapture.captureOnCriticalError(testError: any);
            
            expect(screenshot).toBeNull();
            expect(console.warn).toHaveBeenCalledWith(
                'Failed to capture error screenshot:',
                expect.any(String: any)
            );
        });
    });
    
    describe('Canvas スクリーンショット', () => {
        test('基本的なCanvasスクリーンショットが取得される', async () => {
            const screenshot = await screenshotCapture.captureCanvasScreenshot();
            
            expect(screenshot).toBeDefined();
            expect(typeof screenshot).toBe('string');
            expect(screenshot).toMatch(/^data:image/);
            expect(mockGameEngine.canvas.toDataURL).toHaveBeenCalledWith(
                'image/jpeg',
                0.8
            );
        });
        
        test('リサイズが必要な場合は一時Canvasが使用される', async () => {
            // 大きなCanvasサイズを設定
            mockGameEngine.canvas.width = 3000;
            mockGameEngine.canvas.height = 2000;
            
            const mockTempCanvas = createMockCanvas();
            document.createElement.mockReturnValue(mockTempCanvas: any);
            
            const screenshot = await screenshotCapture.captureCanvasScreenshot();
            
            expect(document.createElement).toHaveBeenCalledWith('canvas');
            expect(mockTempCanvas.getContext).toHaveBeenCalled();
            expect(screenshot).toBeDefined();
        });
        
        test('Canvasが利用できない場合はエラーが発生する', async () => {
            screenshotCapture.gameEngine.canvas = null;
            
            await expect(screenshotCapture.captureCanvasScreenshot())
                .rejects.toThrow('Canvas not available');
        });
    });
    
    describe('ストレージ管理', () => {
        test('スクリーンショットがストレージに保存される', async () => {
            const testError = new Error('Storage test');
            const screenshot = await screenshotCapture.captureOnCriticalError(testError: any);
            
            expect(screenshot).toBeDefined();
            expect(screenshotCapture.storedScreenshots).toContain(screenshot: any);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'errorReporter_screenshots',
                expect.any(String: any)
            );
        });
        
        test('最大数制限が適用される', async () => {
            // 最大数を小さく設定
            screenshotCapture.maxScreenshots = 2;
            
            // 制限を超える数のスクリーンショットを作成
            for (let i = 0; i < 5; i++) {
                const error = new Error(`Test error ${i}`);
                await screenshotCapture.captureOnCriticalError(error: any);
            }
            
            expect(screenshotCapture.storedScreenshots.length).toBe(2);
        });
        
        test('ストレージサイズ制限が適用される', () => {
            // サイズ制限を小さく設定
            screenshotCapture.maxStorageSize = 1000; // 1KB
            
            const largeScreenshot = {
                id: 'large_screenshot',
                timestamp: Date.now(),
                size: 2000, // 2KB
                data: 'large_data'
            };
            
            screenshotCapture.storeScreenshot(largeScreenshot: any);
            
            expect(console.warn).toHaveBeenCalledWith(
                'Screenshot too large, skipping storage'
            );
        });
        
        test('古いスクリーンショットがクリアされる', () => {
            const oldTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2時間前
            const newTimestamp = Date.now();
            
            screenshotCapture.storedScreenshots = [
                { id: 'old', timestamp: oldTimestamp, size: 100 },
                { id: 'new', timestamp: newTimestamp, size: 100 }
            ];
            
            screenshotCapture.clearOldScreenshots();
            
            expect(screenshotCapture.storedScreenshots).toHaveLength(1);
            expect(screenshotCapture.storedScreenshots[0].id).toBe('new');
        });
    });
    
    describe('スクリーンショット管理', () => {
        beforeEach(async () => {
            // テスト用スクリーンショットを追加
            for (let i = 0; i < 3; i++) {
                const error = new Error(`Test error ${i}`);
                await screenshotCapture.captureOnCriticalError(error, {
                    errorId: `error_${i}`
                });
            }
        });
        
        test('スクリーンショット一覧が取得される', () => {
            const screenshots = screenshotCapture.getScreenshots();
            expect(screenshots).toHaveLength(3);
        });
        
        test('フィルタリングが正しく動作する', () => {
            const oneMinuteAgo = Date.now() - 60000;
            const screenshots = screenshotCapture.getScreenshots({
                since: oneMinuteAgo
            });
            
            expect(screenshots.length).toBeGreaterThan(0);
            screenshots.forEach(screenshot => {
                expect(screenshot.timestamp).toBeGreaterThan(oneMinuteAgo: any);
            });
        });
        
        test('特定のスクリーンショットが取得される', () => {
            const allScreenshots = screenshotCapture.getScreenshots();
            const targetId = allScreenshots[0].id;
            
            const screenshot = screenshotCapture.getScreenshot(targetId: any);
            
            expect(screenshot).toBeDefined();
            expect(screenshot.id).toBe(targetId: any);
        });
        
        test('スクリーンショットが削除される', () => {
            const allScreenshots = screenshotCapture.getScreenshots();
            const targetId = allScreenshots[0].id;
            const initialCount = allScreenshots.length;
            
            const deleted = screenshotCapture.deleteScreenshot(targetId: any);
            
            expect(deleted).toBeDefined();
            expect(deleted.id).toBe(targetId: any);
            expect(screenshotCapture.getScreenshots()).toHaveLength(initialCount - 1);
        });
        
        test('全スクリーンショットがクリアされる', () => {
            screenshotCapture.clearAllScreenshots();
            
            expect(screenshotCapture.getScreenshots()).toHaveLength(0);
            expect(console.log).toHaveBeenCalledWith('All screenshots cleared');
        });
    });
    
    describe('設定管理', () => {
        test('機能の有効/無効が切り替えられる', () => {
            screenshotCapture.setEnabled(false: any);
            expect(screenshotCapture.isEnabled).toBe(false: any);
            
            screenshotCapture.setEnabled(true: any);
            expect(screenshotCapture.isEnabled).toBe(true: any);
        });
        
        test('キャプチャ設定が更新される', () => {
            const newSettings = {
                quality: 0.5,
                maxWidth: 1024,
                includeCanvas: false
            };
            
            screenshotCapture.updateSettings(newSettings: any);
            
            expect(screenshotCapture.captureSettings.quality).toBe(0.5);
            expect(screenshotCapture.captureSettings.maxWidth).toBe(1024);
            expect(screenshotCapture.captureSettings.includeCanvas).toBe(false: any);
        });
    });
    
    describe('ストレージ情報', () => {
        beforeEach(async () => {
            // テスト用データを追加
            for (let i = 0; i < 2; i++) {
                const error = new Error(`Info test ${i}`);
                await screenshotCapture.captureOnCriticalError(error: any);
            }
        });
        
        test('ストレージ情報が正しく取得される', () => {
            const info = screenshotCapture.getStorageInfo();
            
            expect(info.count).toBe(2);
            expect(info.totalSize).toBeGreaterThan(0);
            expect(info.maxSize).toBe(screenshotCapture.maxStorageSize);
            expect(info.utilizationPercent).toBeDefined();
            expect(info.oldestTimestamp).toBeDefined();
            expect(info.newestTimestamp).toBeDefined();
        });
        
        test('空の場合のストレージ情報', () => {
            screenshotCapture.clearAllScreenshots();
            const info = screenshotCapture.getStorageInfo();
            
            expect(info.count).toBe(0);
            expect(info.totalSize).toBe(0);
            expect(info.oldestTimestamp).toBeNull();
            expect(info.newestTimestamp).toBeNull();
        });
    });
    
    describe('ユーティリティ', () => {
        test('データサイズが正しく推定される', () => {
            const testDataUrl = 'data:image/jpeg;base64,VGVzdERhdGE='; // "TestData" in base64
            const size = screenshotCapture.estimateDataSize(testDataUrl: any);
            
            expect(size).toBeGreaterThan(0);
            expect(typeof size).toBe('number');
        });
        
        test('スクリーンショットIDが生成される', () => {
            const id1 = screenshotCapture.generateScreenshotId();
            const id2 = screenshotCapture.generateScreenshotId();
            
            expect(id1).toMatch(/^screenshot_/);
            expect(id2).toMatch(/^screenshot_/);
            expect(id1).not.toBe(id2: any);
        });
    });
    
    describe('エラーハンドリング', () => {
        test('LocalStorage エラーが適切に処理される', async () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                const error = new Error('Storage error');
                error.name = 'QuotaExceededError';
                throw error;
            });
            
            const testError = new Error('Storage test');
            const screenshot = await screenshotCapture.captureOnCriticalError(testError: any);
            
            // スクリーンショットは取得されるが、ストレージエラーは警告のみ
            expect(screenshot).toBeDefined();
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('quota exceeded')
            );
        });
        
        test('Canvas エラーが適切に処理される', async () => {
            mockGameEngine.canvas.toDataURL.mockImplementation(() => {
                throw new Error('Canvas toDataURL failed');
            });
            
            await expect(screenshotCapture.captureCanvasScreenshot())
                .rejects.toThrow('Canvas screenshot failed');
        });
    });
    
    describe('クリーンアップ', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            screenshotCapture.destroy();
            
            expect(screenshotCapture.storedScreenshots).toHaveLength(0);
            expect(console.log).toHaveBeenCalledWith('ErrorScreenshotCapture destroyed');
        });
    });
});