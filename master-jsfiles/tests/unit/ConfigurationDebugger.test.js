/**
 * ConfigurationDebugger のテスト
 */

describe('ConfigurationDebugger', () => {
    let ConfigurationDebugger;
    let getConfigurationDebugger;
    
    beforeAll(async () => {
        // モジュールを動的にインポート
        const module = await import('../../src/core/ConfigurationDebugger.js');
        ConfigurationDebugger = module.ConfigurationDebugger;
        getConfigurationDebugger = module.getConfigurationDebugger;
    });
    
    beforeEach(() => {
        // 各テスト前にlocalStorageをクリア
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
        
        // URLSearchParamsをモック
        delete window.location;
        window.location = { search: '' };
    });
    
    describe('基本機能', () => {
        test('クラスが正常にインスタンス化される', () => {
            const configDebugger = new ConfigurationDebugger();
            expect(configDebugger).toBeDefined();
            expect(configDebugger.usageTracking).toBeDefined();
            expect(configDebugger.performanceTracking).toBeDefined();
            expect(configDebugger.errorTracking).toBeDefined();
        });
        
        test('デバッグ設定が初期化される', () => {
            const configDebugger = new ConfigurationDebugger();
            expect(configDebugger.debugConfig).toBeDefined();
            expect(configDebugger.debugConfig.trackUsage).toBe(true);
            expect(configDebugger.debugConfig.trackPerformance).toBe(true);
            expect(configDebugger.debugConfig.trackErrors).toBe(true);
        });
        
        test('統計情報が初期化される', () => {
            const configDebugger = new ConfigurationDebugger();
            expect(configDebugger.statistics.totalAccesses).toBe(0);
            expect(configDebugger.statistics.uniqueKeys).toBe(0);
            expect(configDebugger.statistics.errorRate).toBe(0);
        });
    });
    
    describe('アクセス追跡', () => {
        test('設定アクセスが正常に追跡される', () => {
            // デバッグモードを有効化
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            
            expect(configDebugger.usageTracking.accessCount.get('game.score')).toBe(1);
            expect(configDebugger.usageTracking.accessHistory).toHaveLength(1);
            expect(configDebugger.statistics.totalAccesses).toBe(1);
            expect(configDebugger.statistics.uniqueKeys).toBe(1);
        });
        
        test('複数回のアクセスが正しくカウントされる', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackAccess('game', 'score', 100, 'test1', 5, false);
            configDebugger.trackAccess('game', 'score', 100, 'test2', 3, true);
            configDebugger.trackAccess('audio', 'volume', 0.5, 'test3', 2, false);
            
            expect(configDebugger.usageTracking.accessCount.get('game.score')).toBe(2);
            expect(configDebugger.usageTracking.accessCount.get('audio.volume')).toBe(1);
            expect(configDebugger.statistics.totalAccesses).toBe(3);
            expect(configDebugger.statistics.uniqueKeys).toBe(2);
        });
        
        test('ホットキーが正しく識別される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            configDebugger.debugConfig.hotKeyThreshold = 3;
            
            // 3回アクセスしてホットキーにする
            for (let i = 0; i < 3; i++) {
                configDebugger.trackAccess('game', 'score', 100, 'test', 1, false);
            }
            
            expect(configDebugger.usageTracking.hotKeys.has('game.score')).toBe(true);
        });
        
        test('デバッグモードが無効の場合は追跡されない', () => {
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = false;
            
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            
            expect(configDebugger.usageTracking.accessCount.size).toBe(0);
            expect(configDebugger.statistics.totalAccesses).toBe(0);
        });
    });
    
    describe('エラー追跡', () => {
        test('エラーが正常に追跡される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Invalid value', false);
            
            expect(configDebugger.errorTracking.errorsByKey.has('game.score')).toBe(true);
            expect(configDebugger.errorTracking.errorsByKey.get('game.score')).toHaveLength(1);
            expect(configDebugger.errorTracking.errorPatterns.get('VALIDATION_ERROR_game.score')).toBe(1);
        });
        
        test('復旧成功率が正しく計算される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Error 1', true);
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Error 2', false);
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Error 3', true);
            
            const recoveryStats = configDebugger.errorTracking.recoverySuccess.get('game.score');
            expect(recoveryStats.total).toBe(3);
            expect(recoveryStats.recovered).toBe(2);
        });
        
        test('重要なエラーが正しく記録される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackError('game', 'score', 'CONFIGURATION_ACCESS', 'Critical error', false);
            
            expect(configDebugger.errorTracking.criticalErrors).toHaveLength(1);
            expect(configDebugger.errorTracking.criticalErrors[0].errorType).toBe('CONFIGURATION_ACCESS');
        });
    });
    
    describe('パフォーマンス追跡', () => {
        test('アクセス時間が正しく記録される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackAccess('game', 'score', 100, 'test', 15, false);
            
            expect(configDebugger.performanceTracking.accessTimes.has('game.score')).toBe(true);
            expect(configDebugger.performanceTracking.accessTimes.get('game.score')).toContain(15);
        });
        
        test('遅いアクセスが記録される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            configDebugger.debugConfig.slowAccessThreshold = 10;
            
            configDebugger.trackAccess('game', 'score', 100, 'test', 15, false);
            
            expect(configDebugger.performanceTracking.slowAccesses).toHaveLength(1);
            expect(configDebugger.performanceTracking.slowAccesses[0].accessTime).toBe(15);
        });
        
        test('キャッシュヒット率が正しく計算される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, true);  // キャッシュヒット
            configDebugger.trackAccess('game', 'score', 100, 'test', 10, false); // キャッシュミス
            configDebugger.trackAccess('game', 'score', 100, 'test', 3, true);   // キャッシュヒット
            
            const hitRate = configDebugger.performanceTracking.cacheHitRates.get('game.score');
            expect(hitRate.total).toBe(3);
            expect(hitRate.hits).toBe(2);
        });
    });
    
    describe('未使用キー管理', () => {
        test('未使用キーが正しく登録される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.registerUnusedKey('game', 'unusedSetting');
            
            expect(configDebugger.usageTracking.unusedKeys.has('game.unusedSetting')).toBe(true);
        });
        
        test('アクセスされたキーは未使用キーから削除される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.registerUnusedKey('game', 'score');
            expect(configDebugger.usageTracking.unusedKeys.has('game.score')).toBe(true);
            
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            expect(configDebugger.usageTracking.unusedKeys.has('game.score')).toBe(false);
        });
    });
    
    describe('レポート生成', () => {
        test('基本的なレポートが生成される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            // テストデータを追加
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            configDebugger.trackError('game', 'level', 'VALIDATION_ERROR', 'Test error', true);
            
            const report = configDebugger.generateReport();
            
            expect(report.timestamp).toBeDefined();
            expect(report.statistics).toBeDefined();
            expect(report.usage).toBeDefined();
            expect(report.performance).toBeDefined();
            expect(report.errors).toBeDefined();
        });
        
        test('統計情報が正しく計算される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            // テストデータを追加
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, true);
            configDebugger.trackAccess('game', 'level', 50, 'test', 3, false);
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Test error', false);
            
            const report = configDebugger.generateReport();
            
            expect(report.statistics.totalAccesses).toBe(2);
            expect(report.statistics.uniqueKeys).toBe(2);
            expect(report.statistics.errorRate).toBe('50.00%'); // 1エラー / 2アクセス
        });
        
        test('使用状況レポートが正しく生成される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            configDebugger.debugConfig.hotKeyThreshold = 2;
            
            // ホットキーを作成
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            
            // 未使用キーを登録
            configDebugger.registerUnusedKey('game', 'unused');
            
            const report = configDebugger.generateReport();
            
            expect(report.usage.hotKeys).toContain('game.score');
            expect(report.usage.unusedKeys).toContain('game.unused');
            expect(report.usage.topAccessed).toHaveLength(1);
            expect(report.usage.topAccessed[0].key).toBe('game.score');
            expect(report.usage.topAccessed[0].accessCount).toBe(2);
        });
    });
    
    describe('キー詳細情報', () => {
        test('キーの詳細情報が正しく取得される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            configDebugger.debugConfig.hotKeyThreshold = 2;
            
            // テストデータを追加
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, true);
            configDebugger.trackAccess('game', 'score', 100, 'test', 3, false);
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Test error', true);
            
            const details = configDebugger.getKeyDetails('game', 'score');
            
            expect(details.fullKey).toBe('game.score');
            expect(details.accessCount).toBe(2);
            expect(details.isHotKey).toBe(true);
            expect(details.isUnused).toBe(false);
            expect(details.errors).toHaveLength(1);
            expect(details.lastAccess).toBeDefined();
        });
        
        test('未使用キーの詳細情報が正しく取得される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            configDebugger.registerUnusedKey('game', 'unused');
            
            const details = configDebugger.getKeyDetails('game', 'unused');
            
            expect(details.fullKey).toBe('game.unused');
            expect(details.accessCount).toBe(0);
            expect(details.isHotKey).toBe(false);
            expect(details.isUnused).toBe(true);
            expect(details.errors).toHaveLength(0);
        });
    });
    
    describe('設定管理', () => {
        test('デバッグ設定が更新される', () => {
            const configDebugger = new ConfigurationDebugger();
            
            configDebugger.updateConfig({
                trackUsage: false,
                slowAccessThreshold: 20
            });
            
            expect(configDebugger.debugConfig.trackUsage).toBe(false);
            expect(configDebugger.debugConfig.slowAccessThreshold).toBe(20);
        });
        
        test('統計がリセットされる', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            
            // テストデータを追加
            configDebugger.trackAccess('game', 'score', 100, 'test', 5, false);
            configDebugger.trackError('game', 'score', 'VALIDATION_ERROR', 'Test error', false);
            
            expect(configDebugger.statistics.totalAccesses).toBe(1);
            expect(configDebugger.usageTracking.accessCount.size).toBe(1);
            
            configDebugger.resetStatistics();
            
            expect(configDebugger.statistics.totalAccesses).toBe(0);
            expect(configDebugger.usageTracking.accessCount.size).toBe(0);
            expect(configDebugger.errorTracking.errorsByKey.size).toBe(0);
        });
    });
    
    describe('シングルトンパターン', () => {
        test('同じインスタンスが返される', () => {
            const instance1 = getConfigurationDebugger();
            const instance2 = getConfigurationDebugger();
            
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ConfigurationDebugger);
        });
    });
    
    describe('デバッグモード判定', () => {
        test('URLパラメータでデバッグモードが有効になる', () => {
            window.location.search = '?debug=true';
            
            const configDebugger = new ConfigurationDebugger();
            expect(configDebugger.debugConfig.enabled).toBe(true);
        });
        
        test('localStorageでデバッグモードが有効になる', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            expect(configDebugger.debugConfig.enabled).toBe(true);
        });
        
        test('デバッグモードが無効の場合', () => {
            window.location.search = '';
            localStorage.removeItem('debugMode');
            
            const configDebugger = new ConfigurationDebugger();
            expect(configDebugger.debugConfig.enabled).toBe(false);
        });
    });
    
    describe('履歴サイズ制限', () => {
        test('アクセス履歴がサイズ制限される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            configDebugger.debugConfig.maxHistorySize = 5;
            
            // 制限を超えるアクセスを追加
            for (let i = 0; i < 10; i++) {
                configDebugger.trackAccess('game', `key${i}`, i, 'test', 1, false);
            }
            
            expect(configDebugger.usageTracking.accessHistory.length).toBeLessThanOrEqual(5);
        });
        
        test('遅いアクセス履歴がサイズ制限される', () => {
            localStorage.setItem('debugMode', 'true');
            
            const configDebugger = new ConfigurationDebugger();
            configDebugger.debugConfig.enabled = true;
            configDebugger.debugConfig.slowAccessThreshold = 1;
            
            // 遅いアクセスを大量に追加
            for (let i = 0; i < 60; i++) {
                configDebugger.trackAccess('game', `key${i}`, i, 'test', 10, false);
            }
            
            expect(configDebugger.performanceTracking.slowAccesses.length).toBeLessThanOrEqual(50);
        });
    });
});