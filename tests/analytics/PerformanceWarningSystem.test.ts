import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
import { PerformanceWarningSystem  } from '../../src/analytics/PerformanceWarningSystem';
import { RealtimeMonitor  } from '../../src/analytics/RealtimeMonitor';
// Web Audio API のモック
(global: any).AudioContext = jest.fn() as jest.Mock.mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({,
        connect: jest.fn(
        frequency: {
            setValueAtTime: jest.fn()' },'
        type: 'sine',
        start: jest.fn(
        stop: jest.fn(),
    createGain: jest.fn().mockReturnValue({,
        connect: jest.fn(
        gain: {
            setValueAtTime: jest.fn(
            linearRampToValueAtTime: jest.fn(
        exponentialRampToValueAtTime: jest.fn( }
    );
    destination: {},
    currentTime: 0
};
// Notification APIのモック
(global: any).Notification = jest.fn() as jest.Mock.mockImplementation((title, options) => ({
    title,
    ...options,
    close: jest.fn(
    onclick: null
)');'
global.Notification.permission = 'granted';
global.Notification.requestPermission = jest.fn(').mockResolvedValue('granted') as jest.Mock;'
describe('PerformanceWarningSystem', () => {
    let realtimeMonitor: any,
    let warningSystem: any,
    beforeEach((') => {'
        // DOM要素をクリア
        document.body.innerHTML = ','
        
        // RealtimeMonitorのモック
        realtimeMonitor = {
            isMonitoring: false,
            options: {
                fpsThreshold: 30,
                memoryThreshold: 80
            }
        };
        // PerformanceWarningSystemを作成
        warningSystem = new PerformanceWarningSystem(realtimeMonitor);
        // グローバル参照を設定
        window.performanceWarningSystem = warningSystem;
    };
    afterEach(() => {
        if (warningSystem) {
            warningSystem.destroy() }
        jest.clearAllMocks();
        jest.clearAllTimers();
    }');'
    describe('Task 9.2: パフォーマンス警告システムの実装', (') => {'
        test('警告システムが正しく初期化される', () => {
            expect(warningSystem.warningCategories.size).toBeGreaterThan(0);
            expect(warningSystem.warningContainer).toBeTruthy('),'
            expect(document.getElementById('performance-warning-container').toBeTruthy() }');'
        test('警告カテゴリが正しく設定される', (') => {'
            expect(warningSystem.warningCategories.has('performance').toBe(true'),'
            expect(warningSystem.warningCategories.has('memory').toBe(true'),'
            expect(warningSystem.warningCategories.has('fps').toBe(true'),'
            expect(warningSystem.warningCategories.has('error').toBe(true'),'
            expect(warningSystem.warningCategories.has('network').toBe(true'),'
            const performanceCategory = warningSystem.warningCategories.get('performance');
            expect(performanceCategory.name').toBe('パフォーマンス'),'
            expect(performanceCategory.priority).toBe(2);
            expect(performanceCategory.actions').toContain('詳細表示') }');
        test('アラートが正しく処理される', (') => {'
            const alertData = {
                id: 'test-alert-1',
                type: 'performance',
                message: 'Low FPS, detected: 25fps',
                details: { currentFPS: 25, threshold: 30 },
        timestamp: Date.now( },
            warningSystem.processAlert(alertData');'
            expect(warningSystem.activeWarnings.has('test-alert-1').toBe(true);
            expect(warningSystem.warningHistory.length).toBe(1);
        }');'
        test('パフォーマンス警告が正しく処理される', (') => {'
            const warningData = {
                severity: 'warning',
                message: 'High memory usage detected',
                details: { usagePercent: 85 }
            };
            warningSystem.processPerformanceWarning(warningData);
            expect(warningSystem.activeWarnings.size).toBe(1);
            const warning = Array.from(warningSystem.activeWarnings.values()[0];
            expect(warning.type').toBe('performance');'
            expect(warning.message').toBe('High memory usage detected');'
        }');'
        test('重要度が正しく決定される', (') => {'
            // エラータイプは error
            expect(warningSystem.determineSeverity({ type: 'error' }').toBe('error');'
            // 低FPSは critical
            expect(warningSystem.determineSeverity({ 
                details: { currentFPS: 10 } ),
            }').toBe('critical');'
            // 高メモリ使用率は critical
            expect(warningSystem.determineSeverity({ 
                details: { usagePercent: 95 } ))').toBe('critical');'
            // デフォルトは warning
            expect(warningSystem.determineSeverity({)').toBe('warning') }'
        test('カテゴリが正しく決定される', (') => {'
            expect(warningSystem.determineCategory({ type: 'fps' }').toBe('fps');'
            expect(warningSystem.determineCategory({ 
                message: 'FPS is too low'  }').toBe('fps');'
            expect(warningSystem.determineCategory({ 
                message: 'メモリ不足です' ))').toBe('memory'),'
            expect(warningSystem.determineCategory({ 
                message: 'エラーが発生しました' ))').toBe('error'),'
            expect(warningSystem.determineCategory({)').toBe('performance') }'
        test('視覚的警告が表示される', (') => {'
            const warningData = {
                id: 'visual-test',
                type: 'performance',
                severity: 'warning',
                title: 'テスト警告',
                message: 'これはテスト警告です',
                category: 'performance',
        timestamp: Date.now( },
            warningSystem.displayVisualWarning(warningData');'
            const warningElement = document.querySelector('[data-warning-id="visual-test"]');
            expect(warningElement).toBeTruthy();
            expect(warningElement.textContent').toContain('これはテスト警告です');'
        }');'
        test('警告が正しく削除される', (') => {'
            const warningData = {
                id: 'dismiss-test',
                type: 'performance',
                severity: 'warning',
                title: 'テスト警告',
                message: 'これは削除テストです',
                category: 'performance',
        timestamp: Date.now( },
            warningSystem.showWarning(warningData');'
            expect(warningSystem.activeWarnings.has('dismiss-test').toBe(true');'
            warningSystem.dismissWarning('dismiss-test');
            expect(warningSystem.activeWarnings.has('dismiss-test').toBe(false);
        }');'
        test('警告が正しく確認される', (') => {'
            const warningData = {
                id: 'ack-test',
                type: 'performance',
                severity: 'warning',
                title: 'テスト警告',
                message: 'これは確認テストです',
                category: 'performance',
        timestamp: Date.now( },
            warningSystem.showWarning(warningData');'
            warningSystem.acknowledgeWarning('ack-test');
            expect(warningSystem.acknowledgements.has('ack-test').toBe(true');'
            expect(warningSystem.activeWarnings.has('ack-test').toBe(false);
        }');'
        test('重複警告がフィルタリングされる', (') => {'
            const warningData1 = {
                id: 'dup-test-1',
                type: 'performance',
                message: '重複テスト',
        timestamp: Date.now(' };'
            const warningData2 = {
                id: 'dup-test-2',
                type: 'performance',
                message: '重複テスト',
                timestamp: Date.now() + 1000 // 1秒後
            };
            warningSystem.processAlert(warningData1);
            expect(warningSystem.activeWarnings.size).toBe(1);
            warningSystem.processAlert(warningData2);
            expect(warningSystem.activeWarnings.size).toBe(1); // 重複なので増えない
        }');'
        test('警告詳細が正しくフォーマットされる', (') => {'
            // 文字列の場合
            expect(warningSystem.formatWarningDetails('テスト詳細')').toBe('テスト詳細'),'
            // オブジェクトの場合
            const details = { fps: 25, memory: 80 ,
            const formatted = warningSystem.formatWarningDetails(details);
            expect(formatted').toContain('fps: 25','
            expect(formatted').toContain('memory: 80' }'),
        test('音声警告が再生される', (') => {'
            // AudioContextのモックが呼ばれることを確認
            warningSystem.playWarningSound('warning');
            expect(global.AudioContext).toHaveBeenCalled() }');'
        test('ブラウザ通知が表示される', async (') => {'
            const warningData = {
                title: 'テスト通知',
                message: 'テストメッセージ',
                category: 'performance',
                severity: 'warning'
            };
            await warningSystem.showBrowserNotification(warningData);
            expect(global.Notification').toHaveBeenCalledWith('
                'テスト通知',
                expect.objectContaining({
                    body: 'テストメッセージ')) }');'
        test('警告アクションが処理される', (') => {'
            const warningData = {
                id: 'action-test',
                type: 'performance',
                severity: 'warning',
                message: 'アクションテスト',
                category: 'performance'
            };
            warningSystem.activeWarnings.set('action-test', warningData');'
            // モック alert を設定
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}');'
            warningSystem.handleWarningAction('action-test', '詳細表示');
            expect(alertSpy).toHaveBeenCalled();
            alertSpy.mockRestore();
        }');'
        test('最適化提案が生成される', (') => {'
            const fpsWarning = { 
                type: 'performance', 
                category: 'fps' 
            };
            const suggestions = warningSystem.generateOptimizationSuggestions(fpsWarning);
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0]').toContain('エフェクトの品質');'
            const memoryWarning = { 
                category: 'memory' 
            };
            const memorySuggestions = warningSystem.generateOptimizationSuggestions(memoryWarning);
            expect(memorySuggestions[0]').toContain('ブラウザを再起動');'
        }');'
        test.skip('表示警告数が制限される', () => {
            // maxVisibleWarningsを2に設定
            warningSystem.options.maxVisibleWarnings = 2,
            // showWarningメソッドを使って3つの警告を追加
            for (let i = 0, i < 3, i++') {'
                const warningData = {
                    id: `limit-test-${i}`,
                    type: 'performance',
                    severity: 'warning',
                    title: `警告${i}`,
                    message: `テスト警告${i}`,
                    category: 'performance',
                    timestamp: Date.now() + i
                };
                warningSystem.showWarning(warningData');'
            }
            // showWarningメソッド内でlimitVisibleWarningsが自動的に呼ばれるので
            // 最大表示数以下になっていることを確認
            const visibleWarnings = document.querySelectorAll('.warning-item');
            expect(visibleWarnings.length).toBeLessThanOrEqual(warningSystem.options.maxVisibleWarnings);
        }');'
        test('警告統計が正しく計算される', (') => {'
            // 複数の警告を追加
            const warnings = [
                { type: 'performance', severity: 'warning' },
                { type: 'memory', severity: 'error' },
                { type: 'fps', severity: 'critical' }
            ];
            warnings.forEach((warning, i) => {
                warningSystem.processAlert({
                    id: `stats-test-${i}`;);
                    timestamp: Date.now(
                    ...warning
                };
            }
            const stats = warningSystem.getWarningStatistics();
            expect(stats.totalWarnings).toBe(3);
            expect(stats.recentWarnings).toBe(3);
            expect(stats.warningsByType.performance).toBe(1);
            expect(stats.warningsByType.memory).toBe(1);
            expect(stats.warningsBySeverity.warning).toBe(1);
            expect(stats.warningsBySeverity.error).toBe(1);
        }');'
        test('すべての警告がクリアされる', () => {
            // 複数の警告を追加
            for (let i = 0, i < 3, i++') {'
                warningSystem.processAlert({
                    id: `clear-test-${i}`,
                    type: 'performance',
                    message: `テスト${i}`),
                };
            }
            expect(warningSystem.activeWarnings.size).toBe(3);
            warningSystem.clearAllWarnings();
            expect(warningSystem.activeWarnings.size).toBe(0);
        }');'
        test('設定が更新される', () => {
            const newOptions = {
                enableVisualWarnings: false,
                maxVisibleWarnings: 10
            };
            warningSystem.updateOptions(newOptions);
            expect(warningSystem.options.enableVisualWarnings).toBe(false);
            expect(warningSystem.options.maxVisibleWarnings).toBe(10);
        }');'
        test('リソースが正しく解放される', (') => {'
            expect(document.getElementById('performance-warning-container').toBeTruthy();
            warningSystem.destroy('),'
            expect(document.getElementById('performance-warning-container').toBeFalsy();
            expect(warningSystem.warningContainer).toBe(null) }');'
        test('イベントリスナーが正しく設定される', (') => {'
            const alertData = {
                id: 'event-test',
                type: 'performance',
                message: 'イベントテスト'
            };
            // warningContainerが存在することを確認
            expect(warningSystem.warningContainer).toBeTruthy(');'
            // realtime-alertイベントを発火
            window.dispatchEvent(new CustomEvent('realtime-alert', { detail: alertData )','
            expect(warningSystem.activeWarnings.has('event-test').toBe(true) }');'
        test('自動確認が正しく判定される', (') => {'
            expect(warningSystem.shouldAutoAcknowledge({ severity: 'info' }.toBe(true');'
            expect(warningSystem.shouldAutoAcknowledge({ type: 'network' }.toBe(true');'
            expect(warningSystem.shouldAutoAcknowledge({ severity: 'critical' }.toBe(false');'
        }
        test('カスタムイベントが発火される', () => {
            let eventFired = false,
            const eventListener = (') => { eventFired = true };'
            
            window.addEventListener('performance-warning-displayed', eventListener');'
            const warningData = {
                id: 'custom-event-test',
                type: 'performance',
                severity: 'warning',
                message: 'カスタムイベントテスト',
                category: 'performance'
            };
            warningSystem.showWarning(warningData);
            expect(eventFired).toBe(true');'
            window.removeEventListener('performance-warning-displayed', eventListener);
        };
    }
}');'