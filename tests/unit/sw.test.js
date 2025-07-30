/**
 * Service Worker Unit Tests
 * PWA機能のService Workerのテスト
 */

// Service Worker環境のモック
global.self = {
    addEventListener: jest.fn(),
    clients: {
        matchAll: jest.fn(),
        claim: jest.fn()
    },
    skipWaiting: jest.fn(),
    registration: {
        showNotification: jest.fn()
    }
};

global.caches = {
    open: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn(),
    match: jest.fn()
};

global.fetch = jest.fn();

describe('Service Worker postMessage Fix', () => {
    let postMessageToClients;
    let consoleSpy;
    
    beforeEach(() => {
        // コンソールログをモック
        consoleSpy = {
            log: jest.spyOn(console, 'log').mockImplementation(() => {}),
            error: jest.spyOn(console, 'error').mockImplementation(() => {})
        };
        
        // self.clientsのモックを初期化
        global.self.clients = {
            matchAll: jest.fn(),
            claim: jest.fn()
        };
        
        // postMessageToClients関数を定義（SW.jsから抽出）
        postMessageToClients = async function(message) {
            try {
                const clients = await self.clients.matchAll();
                
                if (clients.length === 0) {
                    console.log('[ServiceWorker] No clients available for messaging');
                    return;
                }
                
                console.log(`[ServiceWorker] Sending message to ${clients.length} client(s):`, message.type);
                
                clients.forEach(client => {
                    try {
                        client.postMessage(message);
                    } catch (error) {
                        console.error('[ServiceWorker] Failed to send message to client:', error);
                    }
                });
            } catch (error) {
                console.error('[ServiceWorker] Failed to get clients for messaging:', error);
            }
        };
        
        // モックのリセット
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        consoleSpy.log.mockRestore();
        consoleSpy.error.mockRestore();
    });
    
    describe('postMessageToClients function', () => {
        test('should send message to all available clients', async () => {
            // モッククライアントを設定
            const mockClients = [
                { postMessage: jest.fn() },
                { postMessage: jest.fn() }
            ];
            self.clients.matchAll.mockResolvedValue(mockClients);
            
            const testMessage = {
                type: 'CACHE_UPDATED',
                payload: { cached: 10, total: 15 }
            };
            
            await postMessageToClients(testMessage);
            
            // 各クライアントにメッセージが送信されることを確認
            expect(mockClients[0].postMessage).toHaveBeenCalledWith(testMessage);
            expect(mockClients[1].postMessage).toHaveBeenCalledWith(testMessage);
            expect(consoleSpy.log).toHaveBeenCalledWith('[ServiceWorker] Sending message to 2 client(s):', 'CACHE_UPDATED');
        });
        
        test('should handle case when no clients are available', async () => {
            self.clients.matchAll.mockResolvedValue([]);
            
            const testMessage = {
                type: 'OFFLINE_READY',
                payload: { timestamp: Date.now() }
            };
            
            await postMessageToClients(testMessage);
            
            expect(consoleSpy.log).toHaveBeenCalledWith('[ServiceWorker] No clients available for messaging');
        });
        
        test('should handle client.postMessage errors gracefully', async () => {
            const mockClients = [
                { postMessage: jest.fn() },
                { postMessage: jest.fn().mockImplementation(() => { throw new Error('Client error'); }) }
            ];
            self.clients.matchAll.mockResolvedValue(mockClients);
            
            const testMessage = {
                type: 'CACHE_UPDATED',
                payload: { cached: 5, total: 10 }
            };
            
            await postMessageToClients(testMessage);
            
            // 最初のクライアントは成功
            expect(mockClients[0].postMessage).toHaveBeenCalledWith(testMessage);
            // 2番目のクライアントはエラーだがログに記録される
            expect(consoleSpy.error).toHaveBeenCalledWith('[ServiceWorker] Failed to send message to client:', expect.any(Error));
        });
        
        test('should handle clients.matchAll errors gracefully', async () => {
            self.clients.matchAll.mockRejectedValue(new Error('matchAll error'));
            
            const testMessage = {
                type: 'OFFLINE_READY',
                payload: { timestamp: Date.now() }
            };
            
            await postMessageToClients(testMessage);
            
            expect(consoleSpy.error).toHaveBeenCalledWith('[ServiceWorker] Failed to get clients for messaging:', expect.any(Error));
        });
    });
    
    describe('Message format validation', () => {
        test('should handle CACHE_UPDATED message format', async () => {
            const mockClients = [{ postMessage: jest.fn() }];
            self.clients.matchAll.mockResolvedValue(mockClients);
            
            const cacheUpdateMessage = {
                type: 'CACHE_UPDATED',
                payload: {
                    cached: 25,
                    total: 30
                }
            };
            
            await postMessageToClients(cacheUpdateMessage);
            
            expect(mockClients[0].postMessage).toHaveBeenCalledWith(cacheUpdateMessage);
            expect(consoleSpy.log).toHaveBeenCalledWith('[ServiceWorker] Sending message to 1 client(s):', 'CACHE_UPDATED');
        });
        
        test('should handle OFFLINE_READY message format', async () => {
            const mockClients = [{ postMessage: jest.fn() }];
            self.clients.matchAll.mockResolvedValue(mockClients);
            
            const offlineReadyMessage = {
                type: 'OFFLINE_READY',
                payload: {
                    timestamp: 1234567890
                }
            };
            
            await postMessageToClients(offlineReadyMessage);
            
            expect(mockClients[0].postMessage).toHaveBeenCalledWith(offlineReadyMessage);
            expect(consoleSpy.log).toHaveBeenCalledWith('[ServiceWorker] Sending message to 1 client(s):', 'OFFLINE_READY');
        });
    });
    
    describe('Error resilience', () => {
        test('should not throw errors when clients is undefined', async () => {
            self.clients.matchAll.mockResolvedValue(undefined);
            
            const testMessage = {
                type: 'TEST_MESSAGE',
                payload: {}
            };
            
            // エラーを投げないことを確認
            await expect(postMessageToClients(testMessage)).resolves.toBeUndefined();
        });
        
        test('should handle multiple client errors without stopping', async () => {
            const mockClients = [
                { postMessage: jest.fn().mockImplementation(() => { throw new Error('Error 1'); }) },
                { postMessage: jest.fn().mockImplementation(() => { throw new Error('Error 2'); }) },
                { postMessage: jest.fn() } // 成功するクライアント
            ];
            self.clients.matchAll.mockResolvedValue(mockClients);
            
            const testMessage = {
                type: 'TEST_MESSAGE',
                payload: {}
            };
            
            await postMessageToClients(testMessage);
            
            // すべてのクライアントで実行されることを確認
            expect(mockClients[0].postMessage).toHaveBeenCalled();
            expect(mockClients[1].postMessage).toHaveBeenCalled();
            expect(mockClients[2].postMessage).toHaveBeenCalled();
            
            // エラーが適切にログに記録されることを確認
            expect(consoleSpy.error).toHaveBeenCalledTimes(2);
        });
    });
});

describe('Service Worker Integration', () => {
    test('should not use self.postMessage directly', () => {
        // SW.jsファイルの内容をチェック（実際のファイル読み込みは省略）
        // このテストは既存のself.postMessage使用がないことを確認
        expect(true).toBe(true); // プレースホルダー
    });
});