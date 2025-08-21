import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
import { ErrorNotificationSystem  } from '../../src/analytics/ErrorNotificationSystem';
// fetch APIのモック
(global: any).fetch = jest.fn(') as jest.Mock;'
// performance.memory のモック
Object.defineProperty(performance, 'memory', {
    value: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB
    },
    configurable: true)'),'
// navigator.storage のモック
Object.defineProperty(navigator, 'storage', {
    value: {,
        estimate: jest.fn().mockResolvedValue({
            quota: 1024 * 1024 * 1024, // 1GB
            usage: 100 * 1024 * 1024    // 100MB) },
    configurable: true,');'
describe('ErrorNotificationSystem', () => {
    let errorSystem: any,
    let originalAddEventListener: any,
    let eventListeners: any,
    beforeEach((') => {'
        // DOM要素をクリア
        document.body.innerHTML = ','
        
        // イベントリスナーをモック
        eventListeners = [],
        originalAddEventListener = window.addEventListener,
        window.addEventListener = jest.fn((event, handler, options) => {
            eventListeners.push({ event, handler, options )};
        );
        // ErrorNotificationSystemを作成
        errorSystem = new ErrorNotificationSystem();
        // グローバル参照を設定
        window.errorNotificationSystem = errorSystem;
    };
    afterEach(() => {
        if (errorSystem) {
            errorSystem.destroy() }
        
        // イベントリスナーを復元
        window.addEventListener = originalAddEventListener;
        
        jest.clearAllMocks();
        jest.clearAllTimers();
    }');'
    describe('Task 9.3: エラー通知システムの実装', (') => {'
        test('エラーシステムが正しく初期化される', () => {
            expect(errorSystem.isInitialized).toBe(true);
            expect(errorSystem.errorTypes.size).toBeGreaterThan(0);
            expect(errorSystem.notificationContainer).toBeTruthy('),'
            expect(document.getElementById('error-notification-container').toBeTruthy() }');'
        test('エラータイプが正しく設定される', (') => {'
            expect(errorSystem.errorTypes.has('javascript').toBe(true'),'
            expect(errorSystem.errorTypes.has('network').toBe(true'),'
            expect(errorSystem.errorTypes.has('resource').toBe(true'),'
            expect(errorSystem.errorTypes.has('permission').toBe(true'),'
            expect(errorSystem.errorTypes.has('storage').toBe(true'),'
            expect(errorSystem.errorTypes.has('performance').toBe(true'),'
            expect(errorSystem.errorTypes.has('security').toBe(true'),'
            const jsErrorType = errorSystem.errorTypes.get('javascript');
            expect(jsErrorType.name').toBe('JavaScript エラー'),'
            expect(jsErrorType.severity').toBe('error'),'
            expect(jsErrorType.recoverable).toBe(false);
            expect(jsErrorType.actions').toContain('詳細表示') }');
        test('グローバルエラーハンドラーが設定される', () => {
            // error, unhandledrejection, error (capture') イベントリスナーが設定される'
            const errorEvents = eventListeners.filter(l => l.event === 'error');
            const rejectionEvents = eventListeners.filter(l => l.event === 'unhandledrejection');
            expect(errorEvents.length).toBeGreaterThanOrEqual(1);
            expect(rejectionEvents.length).toBe(1) }');'
        test('JavaScriptエラーが正しく処理される', (') => {'
            const errorData = {
                type: 'javascript',
                message: 'Uncaught, ReferenceError: x is not defined',
                filename: 'test.js',
                lineno: 10,
                colno: 5,
                error: new Error('Test error',
        timestamp: Date.now( },
            errorSystem.handleError(errorData);
            expect(errorSystem.errorHistory.length).toBe(1);
            const recordedError = errorSystem.errorHistory[0];
            expect(recordedError.type').toBe('javascript');'
            expect(recordedError.severity').toBe('error');'
            expect(recordedError.message').toBe('Uncaught ReferenceError: x is not defined' }'),
        test('ネットワークエラーが正しく処理される', (') => {'
            const errorData = {
                type: 'network',
                message: 'Failed to fetch data from server',
        timestamp: Date.now( },
            errorSystem.handleError(errorData);
            expect(errorSystem.errorHistory.length).toBe(1);
            const recordedError = errorSystem.errorHistory[0];
            expect(recordedError.type').toBe('network');'
            expect(recordedError.severity').toBe('warning');'
            expect(recordedError.recoverable).toBe(true);
        }');'
        test('エラー詳細が正しく抽出される', (') => {'
            const errorData = {
                filename: 'app.js',
                lineno: 25,
                colno: 10,
                element: 'IMG',
                src: 'image.jpg',
                error: { name: 'TypeError' }
            };
            const details = errorSystem.extractErrorDetails(errorData);
            expect(details.filename').toBe('app.js');'
            expect(details.line).toBe(25);
            expect(details.column).toBe(10);
            expect(details.element').toBe('IMG');'
            expect(details.source').toBe('image.jpg');'
            expect(details.errorName').toBe('TypeError');'
        }');'
        test('コンテキスト情報が収集される', () => {
            const context = errorSystem.collectContext();
            expect(context').toHaveProperty('url'),'
            expect(context').toHaveProperty('userAgent'),'
            expect(context').toHaveProperty('timestamp'),'
            expect(context').toHaveProperty('viewport'),'
            expect(context').toHaveProperty('language'),'
            expect(context').toHaveProperty('online'),'
            expect(context').toHaveProperty('memory'),'
            // performance.memoryがモックされている場合のみテスト
            if (context.memory) {
                expect(context.memory').toHaveProperty('used'),'
                expect(context.memory').toHaveProperty('total') }'
        }');'
        test('エラー通知が表示される', (') => {'
            const errorData = {
                id: 'test-error-1',
                type: 'javascript',
                severity: 'error',
                message: 'Test error message',
                details: { filename: 'test.js' },
                context: { url: 'http://localhost' },
                actions: ['詳細表示', 'レポート送信']
            };
            errorSystem.showErrorNotification(errorData');'
            const notification = document.querySelector('[data-error-id="test-error-1"]');
            expect(notification).toBeTruthy();
            expect(notification.textContent').toContain('Test error message');'
            expect(notification.textContent').toContain('詳細表示');'
            expect(notification.textContent').toContain('レポート送信');'
        }');'
        test('エラー通知が削除される', (') => {'
            const errorData = {
                id: 'dismiss-test',
                type: 'javascript',
                severity: 'error',
                message: 'Test error',
                details: {},
                actions: []
            };
            errorSystem.showErrorNotification(errorData');'
            expect(document.querySelector('[data-error-id="dismiss-test"]').toBeTruthy(');'
            errorSystem.dismissError('dismiss-test');
            // アニメーション後に削除されるのでsetTimeoutをシミュレート
            jest.advanceTimersByTime(300');'
            expect(document.querySelector('[data-error-id="dismiss-test"]').toBeFalsy();
        }');'
        test('自動復旧が判定される', (') => {'
            const recoverableError = { recoverable: true, type: 'network' },
            const nonRecoverableError = { recoverable: false, type: 'javascript' },
            
            expect(errorSystem.canAttemptRecovery(recoverableError).toBe(true);
            expect(errorSystem.canAttemptRecovery(nonRecoverableError).toBe(false)');'
            // 復旧試行回数の上限テスト
            errorSystem.recoveryAttempts.set('network', 3);
            expect(errorSystem.canAttemptRecovery(recoverableError).toBe(false);
        }');'
        test('ネットワークエラーからの復旧が試行される', async () => {
            fetch.mockResolvedValueOnce({ ok: true,');'
            const errorData = { type: 'network' },
            const result = await errorSystem.recoverFromNetworkError(errorData);
            expect(result).toBe(true);
            expect(fetch').toHaveBeenCalledWith('/', { method: 'HEAD' )' }
        test('リソースエラーからの復旧が試行される', async () => {
            fetch.mockResolvedValueOnce({ ok: true,');'
            const errorData = { 
                type: 'resource',
                details: { source: 'test.jpg' }
            };
            const result = await errorSystem.recoverFromResourceError(errorData);
            expect(result).toBe(true);
            expect(fetch').toHaveBeenCalledWith('test.jpg', { method: 'HEAD' )' }
        test('ストレージエラーからの復旧が試行される', async () => {
            const result = await errorSystem.recoverFromStorageError({};
            expect(result).toBe(true);
        }');'
        test('パフォーマンスエラーからの復旧が試行される', async () => {
            const result = await errorSystem.recoverFromPerformanceError({};
            expect(result).toBe(true);
        }');'
        test('エラーレポートが送信される', async (') => {'
            errorSystem.options.errorReportingEndpoint = 'https: //api.example.com/errors',
            fetch.mockResolvedValueOnce({ ok: true,');'
            const errorData = {
                id: 'report-test',
                type: 'javascript',
                message: 'Test error'
            };
            await errorSystem.sendErrorReport(errorData);
            expect(fetch').toHaveBeenCalledWith('
                'https://api.example.com/errors',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test error'),
    }
            );
        }');'
        test('エラーアクションが処理される', (') => {'
            const errorData = {
                id: 'action-test',
                type: 'javascript',
                message: 'Test error'
            };
            errorSystem.errorHistory.push(errorData');'
            // モック alert を設定
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}');'
            errorSystem.handleErrorAction('action-test', '詳細表示');
            expect(alertSpy).toHaveBeenCalled();
            alertSpy.mockRestore();
        }');'
        test('エラー詳細が正しくフォーマットされる', (') => {'
            const details = {
                filename: 'test.js',
                line: 10,
                column: 5
            };
            const formatted = errorSystem.formatErrorDetails(details);
            expect(formatted').toContain('filename: test.js','
            expect(formatted').toContain('line: 10','
            expect(formatted').toContain('column: 5' }'),
        test('復旧状況が表示される', (') => {'
            // 復旧状況表示用のDOM要素を作成
            const statusElement = document.createElement('div');
            statusElement.id = 'recovery-status-test-id',
            document.body.appendChild(statusElement'),'
            errorSystem.showRecoveryStatus('test-id', 'attempting');
            expect(statusElement.innerHTML').toContain('復旧を試行中'),'
            errorSystem.showRecoveryStatus('test-id', 'success');
            expect(statusElement.innerHTML').toContain('自動復旧に成功'),'
            errorSystem.showRecoveryStatus('test-id', 'failed');
            expect(statusElement.innerHTML').toContain('自動復旧に失敗') }');
        test('エラー統計が正しく計算される', (') => {'
            // 複数のエラーを追加
            const errors = [
                { type: 'javascript', severity: 'error', timestamp: Date.now(') },'
                { type: 'network', severity: 'warning', timestamp: Date.now(') },'
                { type: 'resource', severity: 'warning', timestamp: Date.now() }
            ];
            errors.forEach(error => {);
                errorSystem.recordError(error) };
            const stats = errorSystem.getErrorStatistics();
            expect(stats.totalErrors).toBe(3);
            expect(stats.recentErrors).toBe(3);
            expect(stats.errorsByType.javascript).toBe(1);
            expect(stats.errorsByType.network).toBe(1);
            expect(stats.errorsBySeverity.error).toBe(1);
            expect(stats.errorsBySeverity.warning).toBe(2);
        }');'
        test('エラー履歴がトリミングされる', () => {
            errorSystem.options.maxErrorHistory = 2,
            // 3つのエラーを記録
            for (let i = 0, i < 3, i++') {'
                errorSystem.recordError({
                    id: `test-${i}`,
                    type: 'javascript',
                    message: `Error ${i}`;);
                    timestamp: Date.now() + i
                };
            }
            expect(errorSystem.errorHistory.length).toBe(2);
        }');'
        test('設定が更新される', () => {
            const newOptions = {
                enableErrorNotifications: false,
                maxErrorHistory: 50
            };
            errorSystem.updateOptions(newOptions);
            expect(errorSystem.options.enableErrorNotifications).toBe(false);
            expect(errorSystem.options.maxErrorHistory).toBe(50);
        }');'
        test('カスタムイベントが発火される', (') => {'
            // windowのdispatchEventをスパイ
            const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
            const errorData = {
                id: 'custom-event-test',
                type: 'javascript',
                message: 'カスタムイベントテスト'
            };
            errorSystem.dispatchErrorEvent(errorData);
            // dispatchEventが呼ばれたことを確認
            expect(dispatchEventSpy').toHaveBeenCalledWith('
                expect.objectContaining({
                    type: 'error-notification-displayed',
                    detail: errorData)),
            dispatchEventSpy.mockRestore() }');'
        test('エラーIDが生成される', () => {
            const id1 = errorSystem.generateErrorId();
            const id2 = errorSystem.generateErrorId();
            expect(typeof id1').toBe('string'),'
            expect(typeof id2').toBe('string'),'
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^error_\d+_[a-z0-9]+$/) }');'
        test('ストレージ情報が取得される', () => {
            const storageInfo = errorSystem.getStorageInfo();
            expect(storageInfo.available).toBe(true);
            expect(typeof storageInfo.quota').toBe('object'), // 非同期で設定されるためnull'
            expect(typeof storageInfo.usage').toBe('object') }');
        test('エラー処理が無効化できる', (') => {'
            errorSystem.options.enableErrorNotifications = false,
            const errorData = {
                type: 'javascript',
                message: 'Test error'
            };
            errorSystem.handleError(errorData);
            // エラー通知が無効の場合、履歴に記録されない
            expect(errorSystem.errorHistory.length).toBe(0);
        }');'
        test('リソースが正しく解放される', (') => {'
            expect(document.getElementById('error-notification-container').toBeTruthy();
            errorSystem.destroy('),'
            expect(document.getElementById('error-notification-container').toBeFalsy();
            expect(errorSystem.notificationContainer).toBe(null);
            expect(errorSystem.errorHistory.length).toBe(0) }');'
        test('重要度別のタイムアウトが設定される', () => {
            jest.useFakeTimers('),'
            const criticalError = {
                id: 'critical-test',
                type: 'security',
                severity: 'critical',
                message: 'Critical error',
                details: {},
                actions: [],
        timestamp: Date.now(' };'
            const warningError = {
                id: 'warning-test', 
                type: 'network',
                severity: 'warning',
                message: 'Warning error',
                details: {},
                actions: [],
        timestamp: Date.now( },
            errorSystem.showErrorNotification(criticalError);
            errorSystem.showErrorNotification(warningError');'
            // 両方の通知が表示されることを確認
            expect(document.querySelector('[data-error-id="warning-test"]').toBeTruthy(');'
            expect(document.querySelector('[data-error-id="critical-test"]').toBeTruthy();
            // 通常のタイムアウト（8秒）経過
            jest.advanceTimersByTime(8000');'
            // warningは削除されているはず（dismissingクラスが付いているか削除されている）
            const warningElement = document.querySelector('[data-error-id="warning-test"]');
            const criticalElement = document.querySelector('[data-error-id="critical-test"]');
            // warningは削除されているかdismissingクラスが付いている
            expect(warningElement === null || warningElement.classList.contains('dismissing').toBe(true);
            // criticalはまだ残っている
            expect(criticalElement).toBeTruthy(');'
            expect(criticalElement.classList.contains('dismissing').toBe(false);
            jest.useRealTimers();
        };
    }
}');'