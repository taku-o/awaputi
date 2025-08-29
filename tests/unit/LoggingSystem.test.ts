/**
 * LoggingSystem 単体テスト
 */
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { LoggingSystem, getLoggingSystem } from '../../src/core/LoggingSystem';

// Type definitions
interface LogLevel {
    debug: number;
    info: number;
    warn: number;
    error: number;
}

interface LogEntry {
    timestamp: number;
    level: keyof LogLevel;
    message: string;
    data?: any;
    source?: string;
}

interface LogConfig {
    maxLogSize: number;
    logLevel: keyof LogLevel;
    enableConsole: boolean;
}

interface LogStats {
    total: number;
    byLevel: Record<keyof LogLevel, number>;
    byCategory: Record<string, number>;
}

interface ConfigChangeData {
    category: string;
    key: string;
    oldValue: any;
    newValue: any;
    changeType: 'create' | 'update' | 'delete';
}

interface ConfigConflictData {
    category: string;
    key: string;
    value1: any;
    value2: any;
    resolvedValue: any;
}

interface LogFilter {
    level?: keyof LogLevel;
    category?: string;
    limit?: number;
    newest?: boolean;
}

interface ConsoleOutput {
    debug: any[][];
    info: any[][];
    warn: any[][];
    error: any[][];
}

describe('LoggingSystem', () => {
    let loggingSystem: LoggingSystem;
    let originalConsole: typeof console;
    let mockConsole: ConsoleOutput;

    beforeEach(() => {
        // Consoleモック設定
        mockConsole = {
            debug: [],
            info: [],
            warn: [],
            error: []
        };
        
        originalConsole = global.console;
        global.console = {
            ...originalConsole,
            debug: jest.fn((...args: any[]) => mockConsole.debug.push(args)),
            info: jest.fn((...args: any[]) => mockConsole.info.push(args)),
            warn: jest.fn((...args: any[]) => mockConsole.warn.push(args)),
            error: jest.fn((...args: any[]) => mockConsole.error.push(args))
        };
        
        loggingSystem = new LoggingSystem();
    });

    afterEach(() => {
        global.console = originalConsole;
        loggingSystem.clearLogs();
    });

    describe('基本的なログ機能', () => {
        test('デバッグログを記録する', () => {
            loggingSystem.debug('Debug message', { test: 'data' });
            
            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('debug');
            expect(logs[0].message).toBe('Debug message');
            expect(logs[0].data).toEqual({ test: 'data' });
        });

        test('情報ログを記録する', () => {
            loggingSystem.info('Info message');
            
            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('info');
            expect(logs[0].message).toBe('Info message');
        });

        test('警告ログを記録する', () => {
            loggingSystem.warn('Warning message');
            
            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('warn');
            expect(logs[0].message).toBe('Warning message');
        });

        test('エラーログを記録する', () => {
            loggingSystem.error('Error message');
            
            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('error');
            expect(logs[0].message).toBe('Error message');
        });
    });

    describe('ログレベル制御', () => {
        test('ログレベル設定により出力を制御する', () => {
            loggingSystem.setLogLevel('warn');
            
            loggingSystem.debug('Debug message');
            loggingSystem.info('Info message');
            loggingSystem.warn('Warning message');
            loggingSystem.error('Error message');

            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(2); // warn と error のみ
            expect(logs.map(log => log.level)).toEqual(['warn', 'error']);
        });

        test('デフォルトログレベルはdebug', () => {
            const config = loggingSystem.getConfig();
            expect(config.logLevel).toBe('debug');
        });

        test('ログレベルの変更が適用される', () => {
            loggingSystem.setLogLevel('error');
            
            const config = loggingSystem.getConfig();
            expect(config.logLevel).toBe('error');
        });
    });

    describe('ログフィルタリング', () => {
        beforeEach(() => {
            loggingSystem.debug('Debug 1', null, 'category1');
            loggingSystem.info('Info 1', null, 'category1');
            loggingSystem.warn('Warning 1', null, 'category2');
            loggingSystem.error('Error 1', null, 'category2');
            loggingSystem.debug('Debug 2', null, 'category1');
        });

        test('レベル別フィルタリング', () => {
            const debugLogs = loggingSystem.getLogs({ level: 'debug' });
            expect(debugLogs).toHaveLength(2);
            expect(debugLogs.every(log => log.level === 'debug')).toBe(true);
        });

        test('カテゴリ別フィルタリング', () => {
            const category1Logs = loggingSystem.getLogs({ category: 'category1' });
            expect(category1Logs).toHaveLength(3);
            expect(category1Logs.every(log => log.source === 'category1')).toBe(true);
        });

        test('制限数によるフィルタリング', () => {
            const limitedLogs = loggingSystem.getLogs({ limit: 2 });
            expect(limitedLogs).toHaveLength(2);
        });

        test('新しい順でのフィルタリング', () => {
            const newestLogs = loggingSystem.getLogs({ newest: true, limit: 3 });
            expect(newestLogs).toHaveLength(3);
            expect(newestLogs[0].message).toBe('Debug 2'); // 最新
        });
    });

    describe('ログサイズ管理', () => {
        test('最大ログサイズに到達すると古いログを削除', () => {
            loggingSystem.setMaxLogSize(3);
            
            for (let i = 0; i < 5; i++) {
                loggingSystem.info(`Message ${i}`);
            }

            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(3);
            expect(logs[0].message).toBe('Message 2'); // 古い2つが削除された
        });

        test('ログサイズ設定の変更', () => {
            loggingSystem.setMaxLogSize(100);
            
            const config = loggingSystem.getConfig();
            expect(config.maxLogSize).toBe(100);
        });
    });

    describe('統計情報', () => {
        beforeEach(() => {
            loggingSystem.debug('Debug 1', null, 'category1');
            loggingSystem.debug('Debug 2', null, 'category1');
            loggingSystem.info('Info 1', null, 'category2');
            loggingSystem.warn('Warning 1', null, 'category1');
            loggingSystem.error('Error 1', null, 'category2');
        });

        test('レベル別統計を取得', () => {
            const stats = loggingSystem.getStats();
            expect(stats.total).toBe(5);
            expect(stats.byLevel.debug).toBe(2);
            expect(stats.byLevel.info).toBe(1);
            expect(stats.byLevel.warn).toBe(1);
            expect(stats.byLevel.error).toBe(1);
        });

        test('カテゴリ別統計を取得', () => {
            const stats = loggingSystem.getStats();
            expect(stats.byCategory.category1).toBe(3);
            expect(stats.byCategory.category2).toBe(2);
        });
    });

    describe('コンソール出力制御', () => {
        test('コンソール出力が有効な場合', () => {
            loggingSystem.enableConsoleOutput(true);
            loggingSystem.info('Test message');

            expect(mockConsole.info).toHaveLength(1);
            expect(mockConsole.info[0]).toContain('Test message');
        });

        test('コンソール出力が無効な場合', () => {
            loggingSystem.enableConsoleOutput(false);
            loggingSystem.info('Test message');

            expect(mockConsole.info).toHaveLength(0);
        });

        test('デフォルトではコンソール出力が有効', () => {
            const config = loggingSystem.getConfig();
            expect(config.enableConsole).toBe(true);
        });
    });

    describe('ログクリア', () => {
        test('すべてのログをクリア', () => {
            loggingSystem.info('Message 1');
            loggingSystem.warn('Message 2');

            expect(loggingSystem.getLogs()).toHaveLength(2);

            loggingSystem.clearLogs();

            expect(loggingSystem.getLogs()).toHaveLength(0);
        });

        test('統計情報もクリアされる', () => {
            loggingSystem.info('Message 1');
            loggingSystem.warn('Message 2');

            loggingSystem.clearLogs();

            const stats = loggingSystem.getStats();
            expect(stats.total).toBe(0);
            expect(Object.values(stats.byLevel).every(count => count === 0)).toBe(true);
        });
    });

    describe('設定変更イベント', () => {
        test('設定変更ログを記録', () => {
            const changeData: ConfigChangeData = {
                category: 'game',
                key: 'difficulty',
                oldValue: 'easy',
                newValue: 'hard',
                changeType: 'update'
            };

            loggingSystem.logConfigChange(changeData);

            const logs = loggingSystem.getLogs({ category: 'config' });
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toContain('Configuration changed');
            expect(logs[0].data).toEqual(changeData);
        });

        test('設定競合ログを記録', () => {
            const conflictData: ConfigConflictData = {
                category: 'game',
                key: 'volume',
                value1: 0.5,
                value2: 0.8,
                resolvedValue: 0.8
            };

            loggingSystem.logConfigConflict(conflictData);

            const logs = loggingSystem.getLogs({ category: 'config' });
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('warn');
            expect(logs[0].message).toContain('Configuration conflict');
        });
    });

    describe('エラーハンドリング', () => {
        test('循環参照オブジェクトを適切に処理', () => {
            const circularObj: any = { name: 'test' };
            circularObj.self = circularObj;

            expect(() => {
                loggingSystem.info('Circular object test', circularObj);
            }).not.toThrow();

            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(1);
        });

        test('undefinedデータを適切に処理', () => {
            expect(() => {
                loggingSystem.info('Undefined test', undefined);
            }).not.toThrow();

            const logs = loggingSystem.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].data).toBeUndefined();
        });
    });

    describe('シングルトンパターン', () => {
        test('getLoggingSystemは同じインスタンスを返す', () => {
            const instance1 = getLoggingSystem();
            const instance2 = getLoggingSystem();

            expect(instance1).toBe(instance2);
        });

        test('シングルトンインスタンスでログが共有される', () => {
            const instance1 = getLoggingSystem();
            const instance2 = getLoggingSystem();

            instance1.info('Test from instance1');

            const logs = instance2.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Test from instance1');
        });
    });

    describe('パフォーマンステスト', () => {
        test('大量のログ処理が効率的', () => {
            const startTime = Date.now();
            
            for (let i = 0; i < 1000; i++) {
                loggingSystem.info(`Message ${i}`, { index: i });
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // 1秒以内
            
            const logs = loggingSystem.getLogs();
            expect(logs.length).toBeGreaterThan(0);
        });
    });
});