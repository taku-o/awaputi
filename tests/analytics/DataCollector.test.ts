import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * DataCollector のテスト
 */
import { DataCollector } from '../../src/analytics/DataCollector';

// モッククラス
class MockPrivacyManager {
    consentStatus: boolean;
    optOutFeatures: Set<string>;

    constructor() {
        this.consentStatus = true;
        this.optOutFeatures = new Set();
    }

    async anonymizeData(data: any) {
        return { ...data, anonymized: true };
    }

    checkConsent() {
        return this.consentStatus;
    }

    isOptedOut() {
        return false;
    }

    destroy() {}
}

class MockStorageManager {
    data: Map<string, any[]>;

    constructor() {
        this.data = new Map();
    }

    async saveData(type: string, data: any) {
        const existing = this.data.get(type) || [];
        existing.push(data);
        this.data.set(type, existing);
        return true;
    }

    async getData(type: string) {
        return this.data.get(type) || [];
    }

    destroy() {}
}

describe('DataCollector', () => {
    let dataCollector: any;
    let mockStorageManager: any;
    let mockPrivacyManager: any;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        mockPrivacyManager = new MockPrivacyManager();
        dataCollector = new DataCollector(mockPrivacyManager, mockStorageManager);
    });

    afterEach(() => {
        if (dataCollector) {
            dataCollector.destroy();
        }
        jest.clearAllMocks();
    });

    describe('コンストラクタ', () => {
        test('正しく初期化される', () => {
            expect(dataCollector).toBeDefined();
            expect(dataCollector.privacyManager).toBe(mockPrivacyManager);
            expect(dataCollector.storageManager).toBe(mockStorageManager);
        });

        test('オプションなしで初期化される', () => {
            const collector = new DataCollector();
            expect(collector).toBeDefined();
        });
    });

    describe('イベント収集', () => {
        test('セッションイベントが収集される', async () => {
            const sessionEvent = {
                type: 'session',
                data: {
                    sessionId: 'test_session_123',
                    startTime: Date.now(),
                    userId: 'user_456',
                    userAgent: 'Mozilla/5.0 Test Browser'
                }
            };

            await dataCollector.collectEvent(sessionEvent);

            const storedData = await mockStorageManager.getData('sessionData');
            expect(storedData).toHaveLength(1);
            expect(storedData[0].type).toBe('session');
            expect(storedData[0].data.sessionId).toBe('test_session_123');
        });

        test('インタラクションイベントが収集される', async () => {
            const interactionEvent = {
                type: 'interaction',
                data: {
                    sessionId: 'test_session_123',
                    timestamp: Date.now(),
                    elementId: 'bubble_456',
                    action: 'click',
                    position: { x: 100, y: 200 },
                    bubbleType: 'normal'
                }
            };

            await dataCollector.collectEvent(interactionEvent);

            const storedData = await mockStorageManager.getData('interactionData');
            expect(storedData).toHaveLength(1);
            expect(storedData[0].data.action).toBe('click');
            expect(storedData[0].data.bubbleType).toBe('normal');
        });

        test('パフォーマンスイベントが収集される', async () => {
            const performanceEvent = {
                type: 'performance',
                data: {
                    sessionId: 'test_session_123',
                    timestamp: Date.now(),
                    fps: 60,
                    memoryUsage: {
                        used: 50000000,
                        total: 100000000
                    },
                    renderTime: 16.7
                }
            };

            await dataCollector.collectEvent(performanceEvent);

            const storedData = await mockStorageManager.getData('performanceData');
            expect(storedData).toHaveLength(1);
            expect(storedData[0].data.fps).toBe(60);
            expect(storedData[0].data.memoryUsage.used).toBe(50000000);
        });

        test('エラーイベントが収集される', async () => {
            const errorEvent = {
                type: 'error',
                data: {
                    sessionId: 'test_session_123',
                    timestamp: Date.now(),
                    errorType: 'JavaScript',
                    message: 'Uncaught TypeError: Cannot read property',
                    stack: 'Error at line 1',
                    url: 'http://localhost:8000/game.js',
                    lineNumber: 42,
                    columnNumber: 15
                }
            };

            await dataCollector.collectEvent(errorEvent);

            const storedData = await mockStorageManager.getData('errorData');
            expect(storedData).toHaveLength(1);
            expect(storedData[0].data.errorType).toBe('JavaScript');
            expect(storedData[0].data.message).toContain('Cannot read property');
        });
    });

    describe('バッチ収集', () => {
        test('複数のイベントがバッチで収集される', async () => {
            const events = [
                {
                    type: 'session',
                    data: { sessionId: 'batch_session_1', timestamp: Date.now() }
                },
                {
                    type: 'interaction',
                    data: { sessionId: 'batch_session_1', action: 'click' }
                },
                {
                    type: 'performance',
                    data: { sessionId: 'batch_session_1', fps: 58 }
                }
            ];

            await dataCollector.collectBatch(events);

            const sessionData = await mockStorageManager.getData('sessionData');
            const interactionData = await mockStorageManager.getData('interactionData');
            const performanceData = await mockStorageManager.getData('performanceData');

            expect(sessionData).toHaveLength(1);
            expect(interactionData).toHaveLength(1);
            expect(performanceData).toHaveLength(1);
        });

        test('大量のイベントが効率的に処理される', async () => {
            const batchSize = 1000;
            const events = Array.from({ length: batchSize }, (_, i) => ({
                type: 'interaction',
                data: {
                    sessionId: 'batch_test',
                    timestamp: Date.now() + i,
                    action: 'click',
                    elementId: `element_${i}`
                }
            }));

            const startTime = Date.now();
            await dataCollector.collectBatch(events);
            const endTime = Date.now();

            const storedData = await mockStorageManager.getData('interactionData');
            expect(storedData).toHaveLength(batchSize);
            
            // パフォーマンス検証（2秒以内）
            expect(endTime - startTime).toBeLessThan(2000);
        });

        test('空のバッチが適切に処理される', async () => {
            const result = await dataCollector.collectBatch([]);
            expect(result).toBeDefined();
        });

        test('不正なイベントを含むバッチの処理', async () => {
            const events = [
                {
                    type: 'session',
                    data: { sessionId: 'valid_session', timestamp: Date.now() }
                },
                {
                    type: 'invalid',
                    data: null
                },
                {
                    type: 'interaction',
                    data: { sessionId: 'valid_session', action: 'click' }
                }
            ];

            await dataCollector.collectBatch(events);

            // 有効なイベントは処理される
            const sessionData = await mockStorageManager.getData('sessionData');
            const interactionData = await mockStorageManager.getData('interactionData');
            
            expect(sessionData).toHaveLength(1);
            expect(interactionData).toHaveLength(1);
        });
    });

    describe('プライバシー処理', () => {
        test('データが匿名化される', async () => {
            const personalEvent = {
                type: 'session',
                data: {
                    sessionId: 'privacy_test',
                    userId: 'user_123',
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0 Chrome/91.0'
                }
            };

            jest.spyOn(mockPrivacyManager, 'anonymizeData');

            await dataCollector.collectEvent(personalEvent);

            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
        });

        test('同意確認が実行される', async () => {
            const event = {
                type: 'interaction',
                data: { action: 'click' }
            };

            jest.spyOn(mockPrivacyManager, 'checkConsent');

            await dataCollector.collectEvent(event);

            expect(mockPrivacyManager.checkConsent).toHaveBeenCalled();
        });

        test('オプトアウト時にデータが収集されない', async () => {
            jest.spyOn(mockPrivacyManager, 'isOptedOut').mockReturnValue(true);
            jest.spyOn(mockStorageManager, 'saveData');

            const event = {
                type: 'session',
                data: { sessionId: 'opted_out_session' }
            };

            await dataCollector.collectEvent(event);

            expect(mockStorageManager.saveData).not.toHaveBeenCalled();
        });

        test('プライバシー処理エラーでもデータ収集が継続される', async () => {
            jest.spyOn(mockPrivacyManager, 'anonymizeData').mockRejectedValue(new Error('Privacy processing failed'));
            jest.spyOn(mockStorageManager, 'saveData');

            const event = {
                type: 'session',
                data: { sessionId: 'privacy_error_test' }
            };

            await expect(dataCollector.collectEvent(event)).resolves.not.toThrow();
        });
    });

    describe('データ変換', () => {
        test('カスタム変換処理が適用される', async () => {
            const transformer = (data: any) => ({
                ...data,
                transformed: true,
                processedAt: Date.now()
            });

            dataCollector.addTransformer('session', transformer);

            const event = {
                type: 'session',
                data: { sessionId: 'transform_test' }
            };

            await dataCollector.collectEvent(event);

            const storedData = await mockStorageManager.getData('sessionData');
            expect(storedData[0].transformed).toBe(true);
            expect(storedData[0].processedAt).toBeDefined();
        });
    });

    describe('統計情報', () => {
        test('収集統計が追跡される', async () => {
            const events = [
                { type: 'session', data: { sessionId: 'stat_1' } },
                { type: 'interaction', data: { action: 'click' } },
                { type: 'interaction', data: { action: 'drag' } },
                { type: 'error', data: { message: 'Test error' } }
            ];

            for (const event of events) {
                await dataCollector.collectEvent(event);
            }

            const stats = dataCollector.getStatistics();
            expect(stats.totalEvents).toBe(4);
            expect(stats.eventsByType.session).toBe(1);
            expect(stats.eventsByType.interaction).toBe(2);
            expect(stats.eventsByType.error).toBe(1);
        });
    });

    describe('リソース管理', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            jest.spyOn(mockStorageManager, 'destroy');
            jest.spyOn(mockPrivacyManager, 'destroy');

            dataCollector.destroy();

            expect(mockStorageManager.destroy).toHaveBeenCalled();
            expect(mockPrivacyManager.destroy).toHaveBeenCalled();
        });
    });

    describe('エラーハンドリング', () => {
        test('ストレージエラーが適切に処理される', async () => {
            jest.spyOn(mockStorageManager, 'saveData').mockRejectedValue(new Error('Storage failed'));

            const event = {
                type: 'session',
                data: { sessionId: 'storage_error_test' }
            };

            await expect(dataCollector.collectEvent(event)).resolves.not.toThrow();

            const stats = dataCollector.getStatistics();
            expect(stats.errors).toBeGreaterThan(0);
        });

        test('不正なデータ形式のエラー処理', async () => {
            const invalidEvents = [
                null,
                undefined,
                { type: null, data: {} },
                { type: 'session' }, // data missing
                { data: { sessionId: 'test' } } // type missing
            ];

            for (const invalidEvent of invalidEvents) {
                await expect(dataCollector.collectEvent(invalidEvent)).resolves.not.toThrow();
            }
        });
    });
});