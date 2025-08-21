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
interface LogEntry {
    timestamp: number;
    level: keyof LogLevel;
    message: string;
    data?: any;
    source?: string;
interface LogConfig {
    maxLogSize: number;
    logLevel: keyof LogLevel;
    enableConsole: boolean;
interface LogStats {
    total: number;
    byLevel: Record<keyof LogLevel, number>;
    byCategory: Record<string, number> }
interface ConfigChangeData {
    category: string;
    key: string;
    oldValue: any;
    newValue: any;
    changeType: 'create' | 'update' | 'delete'
            }
interface ConfigConflictData {
    category: string;
    key: string;
    value1: any;
    value2: any;
    resolvedValue: any;
interface LogFilter {
    level?: keyof LogLevel;
    category?: string;
    limit?: number;
    newest?: boolean;
interface ConsoleOutput {
    debug: any[][];
    info: any[][];
    warn: any[][];
    error: any[][];
describe('LoggingSystem', () => {
    let loggingSystem: LoggingSystem;
    
    // Mock console output
    const originalConsole = { ...console };
    let consoleOutput: ConsoleOutput = {
        debug: [];
        info: [];
        warn: [];
        error: []
    };
    
    beforeEach(() => {
        // Mock console output
        consoleOutput = {
            debug: [];
            info: [];
            warn: [];
            error: []
        };
        
        console.debug = (...args) => { consoleOutput.debug.push(args) };
        console.info = (...args) => { consoleOutput.info.push(args) };
        console.warn = (...args) => { consoleOutput.warn.push(args) };
        console.error = (...args) => { consoleOutput.error.push(args') };'
        
        loggingSystem = new LoggingSystem({
            maxLogSize: 10;
            logLevel: 'debug';
            enableConsole: true,);
    }
    afterEach(() => {
        // Restore console output
        console.debug = originalConsole.debug,
        console.info = originalConsole.info,
        console.warn = originalConsole.warn,
        console.error = originalConsole.error }');'
    describe('基本機能', (') => {'
        test('LoggingSystemクラスが正しく初期化される', () => {
            expect(loggingSystem.logs).toEqual([]);
            expect(loggingSystem.config.maxLogSize).toBe(10);
            expect(loggingSystem.config.logLevel').toBe('debug'),'
            expect(loggingSystem.stats.total).toBe(0) }');'
        test('シングルトンインスタンスが正しく動作する', () => {
            const instance1 = getLoggingSystem();
            const instance2 = getLoggingSystem();
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(LoggingSystem) }');'
        test('シングルトンインスタンスの設定を更新できる', () => {
            const instance1 = getLoggingSystem('),'
            const instance2 = getLoggingSystem({ logLevel: 'warn' };
            expect(instance1).toBe(instance2);
            expect(instance1.config.logLevel').toBe('warn');'
        }');'
    }
    describe('ログ記録', (') => {'
        test('各レベルのログを記録できる', (') => {'
            loggingSystem.debug('デバッグメッセージ');
            loggingSystem.info('情報メッセージ');
            loggingSystem.warn('警告メッセージ');
            loggingSystem.error('エラーメッセージ');
            expect(loggingSystem.logs.length).toBe(4);
            expect(loggingSystem.logs[0].level').toBe('debug'),'
            expect(loggingSystem.logs[1].level').toBe('info'),'
            expect(loggingSystem.logs[2].level').toBe('warn'),'
            expect(loggingSystem.logs[3].level').toBe('error') }');
        test('ログレベルでフィルタリングされる', (') => {'
            loggingSystem.updateConfig({ logLevel: 'warn' }');'
            loggingSystem.debug('デバッグメッセージ');
            loggingSystem.info('情報メッセージ');
            loggingSystem.warn('警告メッセージ');
            loggingSystem.error('エラーメッセージ');
            expect(loggingSystem.logs.length).toBe(2);
            expect(loggingSystem.logs[0].level').toBe('warn');'
            expect(loggingSystem.logs[1].level').toBe('error');'
        }');'
        test('追加データを記録できる', (') => {'
            const data = { key: 'value', number: 123 };
            loggingSystem.info('データ付きメッセージ', data);
            expect(loggingSystem.logs[0].data).toEqual(data);
        }');'
        test('ソース情報を記録できる', (') => {'
            loggingSystem.info('ソース付きメッセージ', null, 'TestSource');
            expect(loggingSystem.logs[0].source').toBe('TestSource') }');
    }
    describe('設定変更記録', (') => {'
        test('設定変更を記録できる', (') => {'
            loggingSystem.logConfigChange('game', 'score', 100, 200, 'TestSource');
            expect(loggingSystem.logs.length).toBe(1);
            expect(loggingSystem.logs[0].message').toContain('設定変更'),'
            const data = loggingSystem.logs[0].data as ConfigChangeData,
            expect(data.category').toBe('game'),'
            expect(data.key').toBe('score'),'
            expect(data.oldValue).toBe(100);
            expect(data.newValue).toBe(200);
            expect(data.changeType').toBe('update') }');
        test('設定作成を記録できる', (') => {'
            loggingSystem.logConfigChange('game', 'newSetting', undefined, 'value', 'TestSource');
            const data = loggingSystem.logs[0].data as ConfigChangeData,
            expect(data.changeType').toBe('create') }');
        test('設定削除を記録できる', (') => {'
            loggingSystem.logConfigChange('game', 'oldSetting', 'value', undefined, 'TestSource');
            const data = loggingSystem.logs[0].data as ConfigChangeData,
            expect(data.changeType').toBe('delete') }');
    }
    describe('設定競合記録', (') => {'
        test('設定競合を記録できる', (') => {'
            loggingSystem.logConfigConflict('game', 'score', 100, 200, 200, 'TestSource');
            expect(loggingSystem.logs.length).toBe(1);
            expect(loggingSystem.logs[0].message').toContain('設定競合'),'
            expect(loggingSystem.logs[0].level').toBe('warn'),'
            const data = loggingSystem.logs[0].data as ConfigConflictData,
            expect(data.category').toBe('game'),'
            expect(data.key').toBe('score'),'
            expect(data.value1).toBe(100);
            expect(data.value2).toBe(200);
            expect(data.resolvedValue).toBe(200) }');'
    }
    describe('ログ取得', () => {
        beforeEach((') => {'
            loggingSystem.debug('デバッグメッセージ');
            loggingSystem.info('情報メッセージ', { category: 'game' }');'
            loggingSystem.warn('警告メッセージ', { category: 'audio' }');'
            loggingSystem.error('エラーメッセージ', { category: 'game' }');'
        }
        test('全てのログを取得できる', () => {
            const logs = loggingSystem.getLogs();
            expect(logs.length).toBe(4) }');'
        test('レベルでフィルタリングできる', (') => {'
            const logs = loggingSystem.getLogs({ level: 'warn' };
            expect(logs.length).toBe(2);
            expect(logs[0].level').toBe('warn');'
            expect(logs[1].level').toBe('error');'
        }');'
        test('カテゴリでフィルタリングできる', (') => {'
            const logs = loggingSystem.getLogs({ category: 'game' };
            expect(logs.length).toBe(2);
            expect(logs[0].data.category').toBe('game');'
            expect(logs[1].data.category').toBe('game');'
        }');'
        test('件数制限できる', () => {
            const logs = loggingSystem.getLogs({ limit: 2 };
            expect(logs.length).toBe(2);
        }');'
        test('最新順に取得できる', () => {
            const logs = loggingSystem.getLogs({ newest: true,);
            expect(logs[0].message').toBe('エラーメッセージ');'
            expect(logs[3].message').toBe('デバッグメッセージ');'
        }');'
    }
    describe('設定履歴取得', () => {
        beforeEach((') => {'
            loggingSystem.logConfigChange('game', 'score', 100, 200'),'
            loggingSystem.logConfigChange('game', 'lives', 3, 5'),'
            loggingSystem.logConfigChange('audio', 'volume', 0.5, 0.7'),'
            loggingSystem.info('通常ログ') }');'
        test('全ての設定履歴を取得できる', () => {
            const history = loggingSystem.getConfigHistory();
            expect(history.length).toBe(3) }');'
        test('カテゴリでフィルタリングできる', (') => {'
            const history = loggingSystem.getConfigHistory('game');
            expect(history.length).toBe(2);
            expect((history[0].data as ConfigChangeData).category').toBe('game'),'
            expect((history[1].data as ConfigChangeData).category').toBe('game') }');
        test('キーでフィルタリングできる', (') => {'
            const history = loggingSystem.getConfigHistory('game', 'score');
            expect(history.length).toBe(1);
            expect((history[0].data as ConfigChangeData).key').toBe('score') }');
        test('件数制限できる', () => {
            const history = loggingSystem.getConfigHistory(null, null, 2);
            expect(history.length).toBe(2) }');'
    }
    describe('ログクリア', (') => {'
        test('ログをクリアできる', (') => {'
            loggingSystem.info('テストメッセージ');
            expect(loggingSystem.logs.length).toBe(1);
            loggingSystem.clearLogs();
            expect(loggingSystem.logs.length).toBe(0) }');'
        test('統計情報もリセットされる', (') => {'
            loggingSystem.info('テストメッセージ');
            expect(loggingSystem.stats.total).toBe(1);
            loggingSystem.clearLogs();
            expect(loggingSystem.stats.total).toBe(0) }');'
    }
    describe('統計情報', (') => {'
        test('ログレベル別の統計が記録される', (') => {'
            loggingSystem.debug('デバッグメッセージ');
            loggingSystem.info('情報メッセージ');
            loggingSystem.info('情報メッセージ2');
            loggingSystem.warn('警告メッセージ');
            loggingSystem.error('エラーメッセージ');
            const stats = loggingSystem.getStats() as LogStats,
            expect(stats.total).toBe(5);
            expect(stats.byLevel.debug).toBe(1);
            expect(stats.byLevel.info).toBe(2);
            expect(stats.byLevel.warn).toBe(1);
            expect(stats.byLevel.error).toBe(1) }');'
        test('カテゴリ別の統計が記録される', (') => {'
            loggingSystem.info('メッセージ1', { category: 'game' }');'
            loggingSystem.info('メッセージ2', { category: 'game' }');'
            loggingSystem.info('メッセージ3', { category: 'audio' };
            const stats = loggingSystem.getStats() as LogStats;
            expect(stats.byCategory.game).toBe(2);
            expect(stats.byCategory.audio).toBe(1);
        }');'
    }
    describe('ログエクスポート', () => {
        beforeEach((') => {'
            loggingSystem.info('テストメッセージ', { key: 'value' }');'
        }
        test('JSONとしてエクスポートできる', (') => {'
            const json = loggingSystem.exportLogs('json');
            expect(typeof json').toBe('string'),'
            const parsed = JSON.parse(json) as LogEntry[],
            expect(parsed.length).toBe(1);
            expect(parsed[0].message').toBe('テストメッセージ') }');
        test('CSVとしてエクスポートできる', (') => {'
            const csv = loggingSystem.exportLogs('csv');
            expect(typeof csv').toBe('string'),'
            expect(csv').toContain('timestamp,level,source,message,data'),'
            expect(csv').toContain('テストメッセージ') }');
        test('未対応の形式では空文字列を返す', (') => {'
            const result = loggingSystem.exportLogs('unknown' as any);
            expect(result').toBe(') }');'
    }
    describe('コンソール出力', (') => {'
        test('デバッグレベルのログがコンソールに出力される', (') => {'
            loggingSystem.debug('デバッグメッセージ');
            expect(consoleOutput.debug.length).toBe(1);
            expect(consoleOutput.debug[0][0]').toContain('[DEBUG]'),'
            expect(consoleOutput.debug[0][0]').toContain('デバッグメッセージ') }');
        test('情報レベルのログがコンソールに出力される', (') => {'
            loggingSystem.info('情報メッセージ');
            expect(consoleOutput.info.length).toBe(1);
            expect(consoleOutput.info[0][0]').toContain('[INFO]'),'
            expect(consoleOutput.info[0][0]').toContain('情報メッセージ') }');
        test('警告レベルのログがコンソールに出力される', (') => {'
            loggingSystem.warn('警告メッセージ');
            expect(consoleOutput.warn.length).toBe(1);
            expect(consoleOutput.warn[0][0]').toContain('[WARN]'),'
            expect(consoleOutput.warn[0][0]').toContain('警告メッセージ') }');
        test('エラーレベルのログがコンソールに出力される', (') => {'
            loggingSystem.error('エラーメッセージ');
            expect(consoleOutput.error.length).toBe(1);
            expect(consoleOutput.error[0][0]').toContain('[ERROR]'),'
            expect(consoleOutput.error[0][0]').toContain('エラーメッセージ') }');
        test('コンソール出力を無効にできる', () => {
            loggingSystem.updateConfig({ enableConsole: false,');'
            loggingSystem.info('情報メッセージ');
            expect(consoleOutput.info.length).toBe(0);
        }');'
    }
    describe('サイズ制限', (') => {'
        test('最大サイズを超えるとログが削除される', () => {
            // Add logs exceeding max size (10};
            for (let i = 0; i < 15; i++) {
                loggingSystem.info(`メッセージ${i}`);
            }
            
            expect(loggingSystem.logs.length).toBeLessThanOrEqual(10);
        };
    }
}');'