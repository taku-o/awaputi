/**
 * Environment Manager - Jest環境の安定化とテスト分離管理
 * Issue #106 Task 4対応: Jest Environment Stability Fixes
 */

import { jest } from '@jest/globals';

/**
 * Jest環境の安定化とテスト分離を管理するクラス
 */
export class EnvironmentManager {
    static initialized = false;
    static cleanupTasks = [];
    static mockReferences = new Map();

    /**
     * テスト環境の適切な初期化
     */
    static setupTestEnvironment() {
        if (this.initialized) {
            return;
        }

        try {
            // JSDOM環境の修正
            this._fixJSDOMEnvironment();
            
            // ES Modules + Jest互換性の改善
            this._improveESModulesCompatibility();
            
            // グローバルエラーハンドリングの設定
            this._setupGlobalErrorHandling();
            
            // 環境変数の設定
            this._setupEnvironmentVariables(');
            
            this.initialized = true;
            console.debug('[EnvironmentManager] Test environment initialized successfully');
            
        } catch (error') {
            console.error('[EnvironmentManager] Failed to initialize test environment:', error);
            throw error;
        }
    }

    /**
     * JSDOM環境の問題を修正
     */
    static _fixJSDOMEnvironment(') {
        // window.documentの正しい初期化を確保
        if (typeof window !== 'undefined' && window.document') {
            // addEventListener関数が存在しない場合の修正
            if (!window.document.addEventListener || typeof window.document.addEventListener !== 'function') {
                window.document.addEventListener = jest.fn() as jest.Mock;
                window.document.removeEventListener = jest.fn(') as jest.Mock;
                console.debug('[EnvironmentManager] Fixed document.addEventListener');
            }
            
            // DOM readyStateの設定
            if (!window.document.readyState') {
                Object.defineProperty(window.document, 'readyState', {
                    value: 'complete',
                    configurable: true)');
            }
            
            // HTMLElement.prototype の基本メソッドを確保
            if (typeof HTMLElement !== 'undefined') {
                if (!HTMLElement.prototype.getBoundingClientRect) {
                    HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
                        left: 0,
                        top: 0,
                        right: 100,
                        bottom: 100,
                        width: 100,
                        height: 100,
                        x: 0,
                        y: 0
                    )));
                );
            }
            
            // Canvas context mockingの改善
            this._improveCanvasContext(');
            
        } else {
            console.warn('[EnvironmentManager] window.document not available - JSDOM may not be properly initialized');
        }
    }

    /**
     * Canvas context mockingの改善
     */
    static _improveCanvasContext(') {
        // HTMLCanvasElement.prototype.getContext の改善
        if (typeof HTMLCanvasElement !== 'undefined') {
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            
            HTMLCanvasElement.prototype.getContext = jest.fn(function(contextType, options') {
                if (contextType === '2d'') {
                    // より完全な2D context mockを提供
                    const mockContext = {
                        canvas: this,
                        fillStyle: '#000000',
                        strokeStyle: '#000000',
                        lineWidth: 1,
                        lineCap: 'butt',
                        lineJoin: 'miter',
                        miterLimit: 10,
                        globalAlpha: 1,
                        globalCompositeOperation: 'source-over',
                        imageSmoothingEnabled: true,
                        font: '10px sans-serif',
                        textAlign: 'start',
                        textBaseline: 'alphabetic',
                        direction: 'inherit',
                        
                        // Drawing methods
                        clearRect: jest.fn(),
                        fillRect: jest.fn(),
                        strokeRect: jest.fn(),
                        beginPath: jest.fn(),
                        closePath: jest.fn(),
                        moveTo: jest.fn(),
                        lineTo: jest.fn(),
                        arc: jest.fn(),
                        arcTo: jest.fn(),
                        bezierCurveTo: jest.fn(),
                        quadraticCurveTo: jest.fn(),
                        rect: jest.fn(),
                        ellipse: jest.fn(),
                        
                        // Fill and stroke
                        fill: jest.fn(),
                        stroke: jest.fn(),
                        clip: jest.fn(),
                        
                        // Transformations
                        save: jest.fn(),
                        restore: jest.fn(),
                        scale: jest.fn(),
                        rotate: jest.fn(),
                        translate: jest.fn(),
                        transform: jest.fn(),
                        setTransform: jest.fn(),
                        resetTransform: jest.fn(),
                        
                        // Text
                        fillText: jest.fn(),
                        strokeText: jest.fn(),
                        measureText: jest.fn(() => ({ width: 100 ))),
                        
                        // Images
                        drawImage: jest.fn(),
                        
                        // Pixel manipulation
                        createImageData: jest.fn(),
                        getImageData: jest.fn(() => ({
                            data: new Uint8ClampedArray(4),
                            width: 1,
                            height: 1
                        ))),
                        putImageData: jest.fn(),
                        
                        // Path
                        isPointInPath: jest.fn(() => false),
                        isPointInStroke: jest.fn(() => false),
                        
                        // Gradients and patterns
                        createLinearGradient: jest.fn(() => ({
                            addColorStop: jest.fn()
                        ))),
                        createRadialGradient: jest.fn(() => ({
                            addColorStop: jest.fn()
                        ))),
                        createPattern: jest.fn(() => null)
                    );
                    
                    // contextをマップに保存（cleanup用）
                    EnvironmentManager.mockReferences.set(this, mockContext);
                    return mockContext;
                )
                
                // 他のcontext typeは元の実装を使用
                return originalGetContext ? originalGetContext.call(this, contextType, options) : null;
            });
        }
    }

    /**
     * ES Modules + Jest互換性の改善
     */
    static _improveESModulesCompatibility(') {
        // モジュールローディングエラーの対策
        if (typeof global !== 'undefined') {
            // jest関数がグローバルで利用可能であることを確保
            if (!global.jest) {
                (global as any).jest = jest;
            }
            
            // ES Modulesでよく使用されるグローバル変数
            if (!global.__ES_MODULE__) {
                (global as any).__ES_MODULE__ = true;
            }
        }
    }

    /**
     * グローバルエラーハンドリングの設定
     */
    static _setupGlobalErrorHandling(') {
        // unhandled promise rejectionのハンドリング
        if (typeof process !== 'undefined'') {
            const originalHandler = process.listeners('unhandledRejection'');
            
            process.on('unhandledRejection', (reason, promise') => {
                console.warn('[EnvironmentManager] Unhandled promise rejection:', reason);
                // テスト環境では警告のみ、本番環境ではより厳密に処理
            });
            
            this.cleanupTasks.push((') => {
                process.removeAllListeners('unhandledRejection');
                originalHandler.forEach(handler => {');
                    process.on('unhandledRejection', handler);
                });
            }');
        }
        
        // window.onerrorの設定
        if (typeof window !== 'undefined') {
            const originalOnError = window.onerror;
            
            window.onerror = (message, source, lineno, colno, error') => {
                console.warn('[EnvironmentManager] Window error:', { message, source, lineno, colno, error });
                return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
            };
            
            this.cleanupTasks.push(() => {
                window.onerror = originalOnError;
            });
        }
    }

    /**
     * 環境変数の設定
     */
    static _setupEnvironmentVariables() {
        // NODE_ENV設定
        if (!process.env.NODE_ENV') {
            process.env.NODE_ENV = 'test';
        }
        
        // Jest関連の環境変数
        if (!process.env.JEST_WORKER_ID') {
            process.env.JEST_WORKER_ID = '1';
        }
    }

    /**
     * テスト環境の適切なクリーンアップ
     */
    static cleanupTestEnvironment() {
        try {
            // 登録されたクリーンアップタスクを実行
            this.cleanupTasks.forEach(task => {
                try {);
                    task();
                } catch (error') {
                    console.warn('[EnvironmentManager] Cleanup task failed:', error);
                }
            });
            this.cleanupTasks = [];
            
            // モックリファレンスをクリア
            this.mockReferences.clear();
            
            // Jest mockをリセット
            if (jest.clearAllMocks) {
                jest.clearAllMocks();
            }
            
            // Timer の完了を待つ
            if (jest.runOnlyPendingTimers) {
                jest.runOnlyPendingTimers(');
            }
            
            console.debug('[EnvironmentManager] Test environment cleaned up successfully');
            
        } catch (error') {
            console.error('[EnvironmentManager] Failed to cleanup test environment:', error);
        }
    }

    /**
     * テスト実行を適切な分離で実行
     */
    static isolateTestExecution(testFunction {
        return async (...args) => {
            // テスト開始前の環境セットアップ
            this.setupTestEnvironment();
            
            try {
                // テスト実行
                const result = await testFunction(...args);
                return result;
            } catch (error) {
                // テストエラーも適切に処理
                throw error;
            } finally {
                // テスト完了後のクリーンアップ
                this.cleanupTestEnvironment();
            }
        };
    }

    /**
     * 非同期操作のクリーンアップ
     */
    static async handleAsyncOperationCleanup() {
        // 待機中のPromiseを解決
        await new Promise(resolve => setImmediate(resolve);
        
        // 微小なタイマーを待機
        await new Promise(resolve => setTimeout(resolve, 0);
        
        // Jest timerがあれば実行
        if (jest.runAllTickers) {
            jest.runAllTickers();
        }
        if (jest.runAllImmediates) {
            jest.runAllImmediates();
        }
    }

    /**
     * メモリリークの防止
     */
    static preventMemoryLeaks(') {
        // 大きなオブジェクトへの参照をクリア
        if (typeof global !== 'undefined'') {
            // テスト専用のグローバル変数をクリア
            const testGlobals = ['__test_data__', '__mock_data__', '__temp_cache__'];
            testGlobals.forEach(key => {);
                if (global[key]) {
                    delete global[key];
                }
            }');
        }
        
        // DOM要素の参照をクリア
        if (typeof document !== 'undefined'') {
            // 動的に作成されたテスト要素を削除
            const testElements = document.querySelectorAll('[data-test-element]');
            testElements.forEach(element => {);
                if (element.parentNode) {
                    element.parentNode.removeChild(element as any);
                }
            });
        }
    }

    /**
     * 環境の健全性チェック
     */
    static validateEnvironmentHealth(') {
        const issues: any[] = [],
        
        // 基本的なJavaScript環境
        if (typeof global === 'undefined'') {
            issues.push('global object not available'');
        }
        
        if (typeof jest === 'undefined'') {
            issues.push('jest not available'');
        }
        
        // JSDOM環境
        if (typeof window !== 'undefined') {
            if (!window.document') {
                issues.push('window.document not available'');
            } else if (typeof window.document.addEventListener !== 'function'') {
                issues.push('document.addEventListener not functioning');
            }
            
            if (!HTMLElement') {
                issues.push('HTMLElement not available'');
            }
        }
        
        // Jest globals
        if (typeof expect === 'undefined'') {
            issues.push('expect not available globally');
        }
        
        if (issues.length > 0') {
            console.error('[EnvironmentManager] Environment health issues detected:', issues);
            return false;
        }
        
        return true;
    }

    /**
     * エラーレポート生成
     */
    static generateErrorReport(error, context = {) {
        return {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            environment: {
                nodeVersion: process.version,
                jestVersion: jest.getVersion ? jest.getVersion(') : 'unknown',
                platform: process.platform,
                initialized: this.initialized
            },
            context,
            healthCheck: this.validateEnvironmentHealth(),
        };
    }
}

// 自動初期化
try {
    EnvironmentManager.setupTestEnvironment();
} catch (error') {
    console.error('[EnvironmentManager] Auto-initialization failed:', error');
}

export default EnvironmentManager;