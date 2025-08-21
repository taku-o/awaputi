import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * ErrorRecoveryTracker テストスイート'
 */''
import { ErrorRecoveryTracker  } from '../../src/debug/ErrorRecoveryTracker';
// モックGameEngine
const createMockGameEngine = () => ({ canvas: {
        width: 800,
        height: 600);
       , getContext: jest.fn(() => ({
            save: jest.fn(),
            restore: jest.fn(),
            setTransform: jest.fn(),
        clearRect: jest.fn();
        )));
    ),
    cacheSystem: {
        clearCache: jest.fn(); }
    },
    objectPool: { cleanup: jest.fn(); }
    },
    particleManager: { cleanup: jest.fn(),
        disable: jest.fn(); }
    },
    audioManager: { stop: jest.fn().mockResolvedValue(),'
        initialize: jest.fn().mockResolvedValue(),'';
        mute: jest.fn()'); }
    },'
    sceneManager: { ' }'
        currentScene: { constructor: { name: 'TestScene' } },
        reloadCurrentScene: jest.fn().mockResolvedValue(),
    },
    effectManager: { disable: jest.fn(); }
    },
    renderOptimizer: { reset: jest.fn(); }
    },
    playerData: { enableFallbackMode: jest.fn(); }
    },
    settingsManager: { enableFallbackMode: jest.fn(); }
    },
    enableSafeMode: jest.fn(),
    bubbleManager: { restart: jest.fn().mockResolvedValue(); }
    }
});
// モックErrorReporter
const createMockErrorReporter = () => ({ sessionStartTime: Date.now(),'
        gameEngine: createMockGameEngine(),' }'
}');''
describe('ErrorRecoveryTracker', () => {  let recoveryTracker: any,
    let mockErrorReporter: any,
    
    beforeEach(() => {
        mockErrorReporter = createMockErrorReporter();
        recoveryTracker = new ErrorRecoveryTracker(mockErrorReporter as any);
        // LocalStorageのモック
        (global as any).localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(), }
        removeItem: jest.fn(); }
        };
        
        // Performance APIのモック
        (global as any).performance = { memory: {
                usedJSHeapSize: 1000000 }
            }
        },
        
        // Window.gcのモック'
        (global as any).window = { ''
            gc: jest.fn()'); }
        };
        ';
        // コンソールのモック''
        jest.spyOn(console, 'log').mockImplementation('')';
        jest.spyOn(console, 'warn').mockImplementation('')';
        jest.spyOn(console, 'error').mockImplementation();
        // タイマーのモック
        jest.useFakeTimers();
    });
    afterEach(() => {  recoveryTracker.destroy();
        jest.restoreAllMocks(); }
        jest.runOnlyPendingTimers(); }'
        jest.useRealTimers(});''
    }');''
    describe('初期化', (') => {  ''
        test('ErrorRecoveryTrackerが正しく初期化される', () => {
            expect(recoveryTracker).toBeDefined();
            expect(recoveryTracker.recoveryStrategies.size).toBeGreaterThan(0);
            expect(recoveryTracker.recoveryAttempts).toEqual([]); }'
            expect(recoveryTracker.recoveryConfig.enabled).toBe(true););' }'
        }');''
        test('復旧戦略が正しく登録される', (') => {  ''
            expect(recoveryTracker.recoveryStrategies.has('memory_cleanup').toBe(true');''
            expect(recoveryTracker.recoveryStrategies.has('canvas_reset').toBe(true');''
            expect(recoveryTracker.recoveryStrategies.has('audio_restart').toBe(true);');' }'
            expect(recoveryTracker.recoveryStrategies.has('safe_mode').toBe(true'); }'
        }''
        test('復旧設定が正しく初期化される', () => {  const config = recoveryTracker.recoveryConfig;
            
            expect(config.enabled).toBe(true);
            expect(config.maxAttemptsPerError).toBe(3);
            expect(config.maxAttemptsPerStrategy).toBe(2); }'
            expect(config.cooldownPeriod).toBe(300000); // 5分);' }'
        }');'
    }''
    describe('復旧戦略選択', (') => {  ''
        test('エラーカテゴリに基づいて適切な戦略が選択される', (') => {'
            const memoryError = {''
                id: 'memory_error','';
                message: 'Memory allocation failed','';
                category: 'memory','';
                severity: 'high',' }'
                fingerprint: 'memory_fingerprint' }
            },
            ';
            const strategies = recoveryTracker.selectRecoveryStrategies(memoryError, { );''
            expect(strategies.length).toBeGreaterThan(0');''
            expect(strategies.some(s => s.id === 'memory_cleanup').toBe(true);' }'
        }');''
        test('レンダリングエラーにCanvasリセット戦略が選択される', (') => {  const renderingError = {''
                id: 'render_error','';
                message: 'Canvas rendering failed','';
                category: 'rendering','';
                severity: 'high',' }'
                fingerprint: 'render_fingerprint' }
            },', '';
            const strategies = recoveryTracker.selectRecoveryStrategies(renderingError, { )');''
            expect(strategies.some(s => s.id === 'canvas_reset').toBe(true);' }'
        }');''
        test('戦略が優先度順に並べられる', (') => {  const testError = {''
                id: 'multi_error','';
                message: 'Multiple system error','';
                category: 'system','';
                severity: 'critical',' }'
                fingerprint: 'multi_fingerprint' }
            },
            
            const strategies = recoveryTracker.selectRecoveryStrategies(testError, { );
            // 優先度順になっているかチェック
            for(let i = 1; i < strategies.length; i++) {
                
            }
                expect(strategies[i].priority).toBeGreaterThanOrEqual(strategies[i-1].priority); }'
            }''
        }');'
    }''
    describe('復旧戦略実行', (') => {  ' }'
        test('メモリクリーンアップ戦略が正常に実行される', async (') => {' }'
            const strategy = recoveryTracker.recoveryStrategies.get('memory_cleanup'};'
            const testError = { ''
                id: 'memory_test','';
                message: 'Memory test error',')';
                category: 'memory') }
            }
            ),
            const result = await strategy.action(testError, {});
            expect(result.success).toBe(true);
            expect(window.gc).toHaveBeenCalled();'
            expect(mockErrorReporter.gameEngine.cacheSystem.clearCache).toHaveBeenCalled();''
        }');''
        test('Canvasリセット戦略が正常に実行される', async (') => { ' }'
            const strategy = recoveryTracker.recoveryStrategies.get('canvas_reset'};'
            const testError = { ''
                id: 'canvas_test','';
                message: 'Canvas test error',')';
                category: 'rendering') }
            }
            ),
            const result = await strategy.action(testError, {});
            expect(result.success).toBe(true);'
            expect(mockErrorReporter.gameEngine.canvas.getContext).toHaveBeenCalled();''
        }');''
        test('オーディオ再起動戦略が正常に実行される', async (') => { ' }'
            const strategy = recoveryTracker.recoveryStrategies.get('audio_restart'};'
            const testError = { ''
                id: 'audio_test','';
                message: 'Audio test error',')';
                category: 'audio') }
            }
            ),
            const result = await strategy.action(testError, {});
            expect(result.success).toBe(true);
            expect(mockErrorReporter.gameEngine.audioManager.stop).toHaveBeenCalled();'
            expect(mockErrorReporter.gameEngine.audioManager.initialize).toHaveBeenCalled();''
        }');''
        test('セーフモード切り替えが正常に実行される', async (') => { ' }'
            const strategy = recoveryTracker.recoveryStrategies.get('safe_mode'};'
            const testError = { ''
                id: 'safe_test','';
                message: 'Critical system error',')';
                category: 'system') }
            }
            ),
            const result = await strategy.action(testError, {});
            expect(result.success).toBe(true);
            expect(mockErrorReporter.gameEngine.enableSafeMode).toHaveBeenCalled();'
            expect(mockErrorReporter.gameEngine.effectManager.disable).toHaveBeenCalled();''
        }');''
        test('戦略実行のタイムアウトが正しく動作する', async (') => {  // 長時間実行される戦略をモック'
            const longRunningStrategy = {''
                id: 'long_running','';
                name: 'Long Running Strategy', }'
                action: jest.fn(() => new Promise(resolve => setTimeout(resolve, 15000)) // 15秒' }'
    }');''
            recoveryTracker.recoveryStrategies.set('long_running', longRunningStrategy');'
            const testError = { ''
                id: 'timeout_test','';
                message: 'Timeout test error','';
                category: 'test' }
    }),
            const session = recoveryTracker.startRecoverySession(testError, { );
            // タイムアウトが発生することを確認
            const result = await recoveryTracker.executeRecoveryStrategy(;
                longRunningStrategy, );
                testError);
                {), 
                session;
            );'
            expect(result).toBe(false);' }'
        }');'
    }''
    describe('復旧セッション管理', (') => {  ''
        test('復旧セッションが正しく開始される', (') => {'
            const testError = {''
                id: 'session_test','';
                message: 'Session test error','';
                category: 'test','';
                severity: 'high',' }'
                fingerprint: 'session_fingerprint' }
            },
            
            const session = recoveryTracker.startRecoverySession(testError, { );'
            expect(session.id).toMatch(/^recovery_/);''
            expect(session.error.id').toBe('session_test');
            expect(session.strategiesAttempted).toEqual([]);'
            expect(recoveryTracker.activeRecoveries.get(session.id).toBe(session;);' }'
        }');''
        test('復旧セッションが正しく完了される', (') => {  const testError = {''
                id: 'complete_test','';
                message: 'Complete test error','';
                category: 'test','';
                severity: 'high',' }'
                fingerprint: 'complete_fingerprint' }
            },', '';
            const session = recoveryTracker.startRecoverySession(testError, { )');''
            const result = recoveryTracker.completeRecoverySession(session, true, 'Test success');'
            expect(result.success).toBe(true);''
            expect(result.result').toBe('Test success');
            expect(recoveryTracker.recoveryAttempts).toContain(session);'
            expect(recoveryTracker.activeRecoveries.has(session.id).toBe(false);' }'
        }');''
        test('復旧統計が正しく更新される', (') => {  const testError = {''
                id: 'stats_test','';
                message: 'Stats test error','';
                category: 'test','';
                severity: 'high',' }'
                fingerprint: 'stats_fingerprint' }
            },', '';
            const session = recoveryTracker.startRecoverySession(testError, { )');
            const initialSuccesses = recoveryTracker.recoveryStats.successfulRecoveries;
            const initialFailures = recoveryTracker.recoveryStats.failedRecoveries;', '';
            recoveryTracker.completeRecoverySession(session, true, 'Test success');
            expect(recoveryTracker.recoveryStats.successfulRecoveries).toBe(initialSuccesses + 1);'
            expect(recoveryTracker.recoveryStats.totalAttempts).toBeGreaterThan(0);' }'
        }');'
    }''
    describe('復旧試行', (') => {  ''
        test('基本的な復旧試行が正常に実行される', async (') => {'
            const testError = {''
                id: 'attempt_test','';
                message: 'Memory allocation failed','';
                category: 'memory','';
                severity: 'high',' }'
                fingerprint: 'attempt_fingerprint' }
            },
            
            const result = await recoveryTracker.attemptRecovery(testError, { );
            expect(result.success).toBe(true);
            expect(result.sessionId).toBeDefined();'
            expect(result.duration).toBeGreaterThan(0);' }'
        }');''
        test('復旧が無効化されている場合は実行されない', async (') => {  recoveryTracker.recoveryConfig.enabled = false;
            ';
            const testError = {''
                id: 'disabled_test','';
                message: 'Disabled test error','';
                category: 'test','';
                severity: 'high',' }'
                fingerprint: 'disabled_fingerprint' }
            },
            
            const result = await recoveryTracker.attemptRecovery(testError, { );'
            expect(result.success).toBe(false);''
            expect(result.reason').toBe('Recovery disabled');' }'
        }');''
        test('適用可能な戦略がない場合は失敗する', async (') => {  const testError = {''
                id: 'no_strategy_test','';
                message: 'Unknown error type','';
                category: 'unknown','';
                severity: 'low',' }'
                fingerprint: 'no_strategy_fingerprint' }
            },
            
            const result = await recoveryTracker.attemptRecovery(testError, { );'
            expect(result.success).toBe(false);''
            expect(result.reason').toBe('No applicable strategies');' }'
        }');'
    }''
    describe('冷却期間とレート制限', (') => {  ''
        test('戦略の冷却期間が正しく設定される', async (') => {'
            const testError = {''
                id: 'cooldown_test','';
                message: 'Memory allocation failed','';
                category: 'memory','';
                severity: 'high',' }'
                fingerprint: 'cooldown_fingerprint' }
            },
            ';
            // 最初の復旧試行''
            await recoveryTracker.attemptRecovery(testError, { )');'
            // 同じ戦略が冷却期間中かチェック''
            const isCooledDown = recoveryTracker.isStrategyCooledDown('memory_cleanup', 'cooldown_fingerprint');
            expect(isCooledDown).toBe(false);'
            // 時間を進める''
            jest.advanceTimersByTime(300000'); // 5分進める
            ';
            // 冷却期間が終了したかチェック''
            const isCooledDownAfter = recoveryTracker.isStrategyCooledDown('memory_cleanup', 'cooldown_fingerprint');'
            expect(isCooledDownAfter).toBe(true);' }'
        }');''
        test('戦略の最大試行回数制限が適用される', async (') => {  recoveryTracker.recoveryConfig.maxAttemptsPerStrategy = 1;
            ';
            const testError = {''
                id: 'max_attempts_test','';
                message: 'Memory allocation failed','';
                category: 'memory','';
                severity: 'high',' }'
                fingerprint: 'max_attempts_fingerprint' }
            },
            
            // 最初の試行
            const firstResult = await recoveryTracker.attemptRecovery(testError, { );
            expect(firstResult.success).toBe(true);
            // 2回目の試行（制限に達している）
            const secondResult = await recoveryTracker.attemptRecovery(testError, {);'
            expect(secondResult.success).toBe(false);' }'
        }');'
    }''
    describe('戦略効果性学習', (') => {  ''
        test('戦略成功が正しく記録される', (') => {''
            const initialStats = recoveryTracker.recoveryStats.byStrategy.get('memory_cleanup'');''
            recoveryTracker.recordStrategySuccess('memory_cleanup', 'memory', 1000');''
            const updatedStats = recoveryTracker.recoveryStats.byStrategy.get('memory_cleanup');
            expect(updatedStats.successes).toBe((initialStats? .successes || 0) + 1); }'
            expect(updatedStats.attempts).toBe((initialStats?.attempts || 0) + 1);' }'
        }');''
        test('戦略失敗が正しく記録される', (') => {  ''
            const initialStats = recoveryTracker.recoveryStats.byStrategy.get('memory_cleanup'');''
            recoveryTracker.recordStrategyFailure('memory_cleanup', 'memory', 'Test failure'');''
            const updatedStats = recoveryTracker.recoveryStats.byStrategy.get('memory_cleanup');
            expect(updatedStats.failures).toBe((initialStats?.failures || 0) + 1); }'
            expect(updatedStats.attempts).toBe((initialStats?.attempts || 0) + 1);' }'
        }');''
        test('戦略効果性が正しく計算される', (') => {  // テストデータを設定''
            recoveryTracker.recoveryStats.byStrategy.set('test_strategy', { : undefined)
                attempts: 10);
               , successes: 7,) }'
                failures: 3),' }'
            }');''
            const effectiveness = recoveryTracker.getStrategyEffectiveness('test_strategy', 'test');'
            expect(effectiveness).toBe(0.7); // 7/10''
        }');'
    }''
    describe('レポート生成', () => {  ''
        beforeEach((') => {
            // テスト用復旧履歴を追加'
            const testRecovery = {''
                id: 'test_recovery',';
                startTime: Date.now(),'';
                endTime: Date.now(''';
                   , category: 'memory',' }'
                    severity: 'high' }
                },'
                strategiesAttempted: [{ ''
                        id: 'memory_cleanup','';
                        name: 'Memory Cleanup',
                        success: true,
                        duration: 800 }]
                    }]
                ]);
            })
            )';
            recoveryTracker.recoveryAttempts.push(testRecovery);''
        }');''
        test('復旧レポートが正しく生成される', (') => {  ''
            const report = recoveryTracker.generateRecoveryReport('session');''
            expect(report.timeframe').toBe('session');
            expect(report.summary.totalAttempts).toBeGreaterThan(0);
            expect(report.strategyAnalysis).toBeDefined();
            expect(report.categoryAnalysis).toBeDefined(); }'
            expect(report.recommendations).toBeDefined();' }'
        }');''
        test('戦略分析が正しく実行される', () => { const recoveries = recoveryTracker.recoveryAttempts; }
            const analysis = recoveryTracker.analyzeStrategyPerformance(recoveries})
            );
            expect(Array.isArray(analysis}).toBe(true);
            if(analysis.length > 0) {', '';
                expect(analysis[0]').toHaveProperty('strategyId');''
                expect(analysis[0]').toHaveProperty('attempts');''
                expect(analysis[0]').toHaveProperty('successes');'
            }'
                expect(analysis[0]').toHaveProperty('successRate'); }'
            }''
        }');''
        test('カテゴリ別分析が正しく実行される', () => { const recoveries = recoveryTracker.recoveryAttempts; }
            const analysis = recoveryTracker.analyzeCategoryPerformance(recoveries})
            );
            expect(Array.isArray(analysis}).toBe(true);
            if(analysis.length > 0) {', '';
                expect(analysis[0]').toHaveProperty('category');''
                expect(analysis[0]').toHaveProperty('attempts');'
            }'
                expect(analysis[0]').toHaveProperty('successRate'); }'
            }''
        }');'
    }''
    describe('設定とデータ管理', (') => {  ''
        test('設定が正しく更新される', () => {
            const newConfig = {
                maxAttemptsPerError: 5 }
                cooldownPeriod: 600000 }
            },
            
            recoveryTracker.updateConfiguration(newConfig);
            expect(recoveryTracker.recoveryConfig.maxAttemptsPerError).toBe(5);'
            expect(recoveryTracker.recoveryConfig.cooldownPeriod).toBe(600000);''
        }');''
        test('復旧データが正しく保存される', () => {  }
            recoveryTracker.saveRecoveryData(})'
            );''
            expect(localStorage.setItem).toHaveBeenCalledWith('')';
                'error_recovery_data',)';
                expect.any(String});''
        }');''
        test('復旧データが正しく読み込まれる', () => {  const testData = {
                recoveryStats: {
                    totalAttempts: 10 }
                    successfulRecoveries: 7 }
                }
            },
            
            localStorage.getItem.mockReturnValue(JSON.stringify(testData);
            const newTracker = new ErrorRecoveryTracker(mockErrorReporter as any);
            expect(newTracker.recoveryStats.totalAttempts).toBe(10);
            expect(newTracker.recoveryStats.successfulRecoveries).toBe(7);'
            newTracker.destroy();''
        }');'
    }''
    describe('エラーハンドリング', (') => {  ''
        test('戦略実行中のエラーが適切に処理される', async (') => {
            // エラーを発生させる戦略を作成'
            const errorStrategy = {''
                id: 'error_strategy','';
                name: 'Error Strategy',' }'
                action: jest.fn(').mockRejectedValue(new Error('Strategy error')'); }
            };', '';
            recoveryTracker.recoveryStrategies.set('error_strategy', errorStrategy');'
            const testError = { ''
                id: 'error_test','';
                message: 'Error test','';
                category: 'test','';
                severity: 'high','';
                fingerprint: 'error_fingerprint' }
            },
            
            const session = recoveryTracker.startRecoverySession(testError, { );
            const result = await recoveryTracker.executeRecoveryStrategy(;
                errorStrategy,);
                testError);
                {),
                session;
            );'
            expect(result).toBe(false);''
            expect(session.strategiesAttempted[0].error').toBe('Strategy error');' }'
        }');''
        test('復旧試行全体でのエラーが適切に処理される', async (') => { // 復旧戦略を全て削除してエラー状況を作る }
            recoveryTracker.recoveryStrategies.clear(};
            ';
            const testError = { ''
                id: 'recovery_error_test','';
                message: 'Recovery error test','';
                category: 'test','';
                severity: 'high',')';
                fingerprint: 'recovery_error_fingerprint') }
            }
            ),
            const result = await recoveryTracker.attemptRecovery(testError, {});'
            expect(result.success).toBe(false);''
            expect(result.reason').toBe('No applicable strategies');''
        }');'
    }''
    describe('クリーンアップ', (') => {  ''
        test('destroyメソッドでリソースがクリーンアップされる', (') => {
            // アクティブなセッションを作成'
            const testError = {''
                id: 'cleanup_test','';
                message: 'Cleanup test','';
                category: 'test','';
                severity: 'high',' }'
                fingerprint: 'cleanup_fingerprint' }
            },
            
            const session = recoveryTracker.startRecoverySession(testError, { );'
            recoveryTracker.destroy();''
            expect(localStorage.setItem).toHaveBeenCalledWith('')';
                'error_recovery_data',);
                expect.any(String);
            );
            expect(recoveryTracker.activeRecoveries.size).toBe(0);
            expect(recoveryTracker.cooldownTimers.size).toBe(0); }
        });'
    }''
}');