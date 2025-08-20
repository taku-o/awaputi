import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * ServiceWorker HEAD Request Integration Tests
 * ServiceWorkerのHEADリクエスト処理の統合テスト
 */

describe('ServiceWorker HEAD Request Integration', () => {
    let mockServiceWorker: any;
    let mockCache: any;
    let mockCaches: any;
    let originalFetch: any;
    
    beforeEach(() => {
        // Web API モック
        global.Request = jest.fn() as jest.Mock.mockImplementation((url, options = {}) => ({
            url,
            method: options.method || 'GET',
            headers: options.headers || {}
        }));
        
        global.Response = jest.fn() as jest.Mock.mockImplementation((body, options = {}) => {
            const headers = new Map(Object.entries(options.headers || {}));
            return {
                body,
                status: options.status || 200,
                statusText: options.statusText || 'OK',
                headers: {
                    get: (key) => headers.get(key: any),
                    has: (key) => headers.has(key: any),
                    set: (key, value) => headers.set(key, value),
                    entries: () => headers.entries(),
                    keys: () => headers.keys(),
                    values: () => headers.values()
                },
                ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
                clone: jest.fn().mockReturnThis()
            };
        });
        
        // Service Worker環境のモック
        mockCache = {
            match: jest.fn(),
            put: jest.fn(),
            keys: jest.fn(),
            delete: jest.fn()
        };
        
        mockCaches = {
            open: jest.fn().mockResolvedValue(mockCache: any),
            delete: jest.fn(),
            keys: jest.fn(),
            match: jest.fn()
        };
        
        global.caches = mockCaches;
        originalFetch = global.fetch;
        global.fetch = jest.fn() as jest.Mock;
        
        // コンソールログをモック
        global.console = {
            ...console,
            log: jest.fn(),
            error: jest.fn()
        };
    });
    
    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });
    
    describe('HEAD Request Cache Exclusion', () => {
        test('should not attempt to cache HEAD requests', async () => {
            // HEADリクエストの成功レスポンスをモック
            const mockResponse = new Response(null, { status: 200, statusText: 'OK' });
            global.fetch.mockResolvedValue(mockResponse: any);
            
            // HEADリクエストを作成
            const headRequest = new Request('https://example.com/test.json', { method: 'HEAD' });
            
            // handleHeadRequest関数をシミュレート（実際のSW.jsから）
            const handleHeadRequest = async function(request: any) {
                try {
                    console.log(`[ServiceWorker] HEADリクエスト処理: ${request.url}`);
                    const response = await fetch(request: any);
                    return response;
                } catch (error) {
                    console.log(`[ServiceWorker] HEADリクエストエラー: ${request.url}`, error);
                    return new Response(null, {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: {
                            'Content-Type': 'text/plain',
                            'Cache-Control': 'no-cache'
                        }
                    });
                }
            };
            
            const result = await handleHeadRequest(headRequest: any);
            
            // HEADリクエストが正常に処理されることを確認
            expect(global.fetch).toHaveBeenCalledWith(headRequest: any);
            expect(result.status).toBe(200);
            
            // キャッシュへの保存が試行されないことを確認
            expect(mockCache.put).not.toHaveBeenCalled();
            
            // 適切なログが出力されることを確認
            expect(console.log).toHaveBeenCalledWith('[ServiceWorker] HEADリクエスト処理: https://example.com/test.json');
        });
        
        test('should handle HEAD request network errors gracefully', async () => {
            // ネットワークエラーをモック
            const networkError = new Error('Network unavailable');
            global.fetch.mockRejectedValue(networkError: any);
            
            const headRequest = new Request('https://example.com/unavailable.json', { method: 'HEAD' });
            
            const handleHeadRequest = async function(request: any) {
                try {
                    console.log(`[ServiceWorker] HEADリクエスト処理: ${request.url}`);
                    const response = await fetch(request: any);
                    return response;
                } catch (error) {
                    console.log(`[ServiceWorker] HEADリクエストエラー: ${request.url}`, error);
                    return new Response(null, {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: {
                            'Content-Type': 'text/plain',
                            'Cache-Control': 'no-cache'
                        }
                    });
                }
            };
            
            const result = await handleHeadRequest(headRequest: any);
            
            // フォールバックレスポンスが正しく返されることを確認
            expect(result.status).toBe(503);
            expect(result.statusText).toBe('Service Unavailable');
            expect(result.headers.get('Content-Type')).toBe('text/plain');
            expect(result.headers.get('Cache-Control')).toBe('no-cache');
            
            // エラーログが出力されることを確認
            expect(console.log).toHaveBeenCalledWith('[ServiceWorker] HEADリクエストエラー: https://example.com/unavailable.json', networkError);
            
            // キャッシュへの保存が試行されないことを確認
            expect(mockCache.put).not.toHaveBeenCalled();
        });
    });
    
    describe('Cache Strategy Integration', () => {
        test('should verify cacheResponse skips HEAD requests', async () => {
            // cacheResponse関数をシミュレート
            const cacheResponse = async function(request, response) {
                // HEADリクエストはキャッシュしない
                if (request.method === 'HEAD') {
                    console.log(`[ServiceWorker] HEADリクエストはキャッシュをスキップ: ${request.url}`);
                    return;
                }
                
                const cache = await caches.open('test-cache');
                await cache.put(request, response);
            };
            
            const headRequest = new Request('https://example.com/test.json', { method: 'HEAD' });
            const mockResponse = new Response(null, { status: 200 });
            
            await cacheResponse(headRequest, mockResponse);
            
            // スキップログが出力されることを確認
            expect(console.log).toHaveBeenCalledWith('[ServiceWorker] HEADリクエストはキャッシュをスキップ: https://example.com/test.json');
            
            // キャッシュへの保存が実行されないことを確認
            expect(mockCache.put).not.toHaveBeenCalled();
        });
        
        test('should verify GET requests are still cached normally', async () => {
            // cacheResponse関数をシミュレート
            const cacheResponse = async function(request, response) {
                // HEADリクエストはキャッシュしない
                if (request.method === 'HEAD') {
                    console.log(`[ServiceWorker] HEADリクエストはキャッシュをスキップ: ${request.url}`);
                    return;
                }
                
                const cache = await caches.open('test-cache');
                await cache.put(request, response);
            };
            
            const getRequest = new Request('https://example.com/test.json', { method: 'GET' });
            const mockResponse = new Response('{"test": true}', { status: 200 });
            
            await cacheResponse(getRequest, mockResponse);
            
            // キャッシュが開かれることを確認
            expect(mockCaches.open).toHaveBeenCalledWith('test-cache');
            
            // GETリクエストがキャッシュされることを確認
            expect(mockCache.put).toHaveBeenCalledWith(getRequest, mockResponse);
            
            // HEADスキップログが出力されないことを確認
            expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('HEADリクエストはキャッシュをスキップ'));
        });
    });
    
    describe('Strategy Function Integration', () => {
        test('should verify staleWhileRevalidateStrategy handles HEAD requests', async () => {
            // staleWhileRevalidateStrategyの簡略版をシミュレート
            const staleWhileRevalidateStrategy = async function(request: any) {
                // HEADリクエストはキャッシュしない（安全チェック）
                if (request.method === 'HEAD') {
                    console.log(`[ServiceWorker] HEADリクエスト処理: ${request.url}`);
                    const response = await fetch(request: any);
                    return response;
                }
                
                // 通常のキャッシュ戦略
                const cache = await caches.open('test-cache');
                const cachedResponse = await cache.match(request: any);
                
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                const networkResponse = await fetch(request: any);
                if (networkResponse.ok) {
                    await cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            };
            
            const headRequest = new Request('https://example.com/test.json', { method: 'HEAD' });
            const mockResponse = new Response(null, { status: 200 });
            global.fetch.mockResolvedValue(mockResponse: any);
            
            const result = await staleWhileRevalidateStrategy(headRequest: any);
            
            // HEADリクエストが直接fetchされることを確認
            expect(global.fetch).toHaveBeenCalledWith(headRequest: any);
            expect(result: any).toBe(mockResponse: any);
            
            // キャッシュ操作が実行されないことを確認
            expect(mockCache.match).not.toHaveBeenCalled();
            expect(mockCache.put).not.toHaveBeenCalled();
        });
    });
    
    describe('HelpManager Integration Simulation', () => {
        test('should handle HelpManager HEAD request scenario', async () => {
            // HelpManagerがファイル存在確認で使用するHEADリクエストのシミュレート
            const helpContentUrls = [
                'http://localhost:8000/src/core/help/content/help/en/troubleshooting.json',
                'http://localhost:8000/src/core/help/content/help/troubleshooting.json'
            ];
            
            // 1つ目は成功、2つ目はファイルが存在しない
            global.fetch
                .mockResolvedValueOnce(new Response(null, { status: 200 }))
                .mockResolvedValueOnce(new Response(null, { status: 404 }));
            
            const handleHeadRequest = async function(request: any) {
                try {
                    console.log(`[ServiceWorker] HEADリクエスト処理: ${request.url}`);
                    const response = await fetch(request: any);
                    return response;
                } catch (error) {
                    console.log(`[ServiceWorker] HEADリクエストエラー: ${request.url}`, error);
                    return new Response(null, {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                }
            };
            
            // HEADリクエストを順次処理
            const results: any[] = [];
            for (const url of helpContentUrls) {
                const request = new Request(url, { method: 'HEAD' });
                const result = await handleHeadRequest(request: any);
                results.push({ url, status: result.status });
            }
            
            // 結果を検証
            expect(results[0].status).toBe(200); // 存在するファイル
            expect(results[1].status).toBe(404); // 存在しないファイル
            
            // 両方のリクエストが処理されることを確認
            expect(global.fetch).toHaveBeenCalledTimes(2);
            
            // ログが出力されることを確認
            expect(console.log).toHaveBeenCalledWith('[ServiceWorker] HEADリクエスト処理: http://localhost:8000/src/core/help/content/help/en/troubleshooting.json');
            expect(console.log).toHaveBeenCalledWith('[ServiceWorker] HEADリクエスト処理: http://localhost:8000/src/core/help/content/help/troubleshooting.json');
        });
    });
});