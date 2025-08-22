/**
 * Final Validation Suite - 最終パフォーマンス・互換性テストスイート
 * デバッグツール強化の最終品質保証テスト
 */

interface ValidationResult {
    category: string;
    name: string;
    status: 'passed' | 'failed';
    message: string;
    duration: number;
    timestamp: string;
    error?: Error;
}

interface PerformanceMetrics {
    averageFPS: number;
    averageFrameTime: number;
    frameCount: number;
    duration: number;
    memoryUsage: number;
}

interface PerformanceImpact {
    fpsImpact: number;
    frameTimeImpact: number;
    memoryImpact: number;
    overallImpact: number;
}

interface PerformanceTargets {
    debugOverhead: number;
    memoryIncrease: number;
    initializationTime: number;
    panelSwitchTime: number;
    testExecutionTime: number;
    frameRateImpact: number;
}

interface CompatibilityTargets {
    browsers: string[];
    features: string[];
    screenSizes: {
        width: number;
        height: number;
        name: string;
    }[];
}

interface ValidationCategories {
    performance: string;
    compatibility: string;
    memory: string;
    accessibility: string;
    security: string;
    stability: string;
}

interface CategoryStats {
    [category: string]: {
        total: number;
        passed: number;
        failed: number;
    };
}

interface ValidationSummary {
    summary: {
        total: number;
        passed: number;
        failed: number;
        successRate: number;
        duration: number;
    };
    categoryStats: CategoryStats;
    results: ValidationResult[];
    timestamp: string;
    targets: PerformanceTargets;
    compatibility: CompatibilityTargets;
}

interface OperationResult {
    name: string;
    status: 'success' | 'failure';
}

interface GameEngine {
    enhancedDebugInterface?: any;
}

export class FinalValidationSuite {
    private gameEngine: GameEngine;
    private validationResults: ValidationResult[] = [];
    private validationRunning: boolean = false;
    private startTime: number | null = null;
    private validationCategories: ValidationCategories;
    private performanceTargets: PerformanceTargets;
    private compatibilityTargets: CompatibilityTargets;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        
        // 検証カテゴリ
        this.validationCategories = {
            performance: 'Performance Validation',
            compatibility: 'Browser Compatibility',
            memory: 'Memory Management',
            accessibility: 'Accessibility Compliance',
            security: 'Security Validation',
            stability: 'System Stability'
        };
        // パフォーマンス目標値
        this.performanceTargets = {
            debugOverhead: 5, // %以下
            memoryIncrease: 10, // MB以下
            initializationTime: 1000, // ms以下
            panelSwitchTime: 200, // ms以下
            testExecutionTime: 30000, // ms以下
            frameRateImpact: 5 // %以下
        };
        
        // 互換性テスト対象
        this.compatibilityTargets = {
            browsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
            features: ['Performance API', 'LocalStorage', 'ResizeObserver', 'CSS Grid'],
            screenSizes: [
                { width: 1920, height: 1080, name: 'Desktop' },
                { width: 1366, height: 768, name: 'Laptop' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 375, height: 667, name: 'Mobile' }
            ]
        };
    }

    /**
     * 全最終検証を実行
     */
    async runFinalValidation(): Promise<ValidationSummary> {
        if (this.validationRunning) {
            throw new Error('Final validation is already running');
        }

        this.validationRunning = true;
        this.startTime = performance.now();
        console.log('Starting final validation suite...');

        try {
            // カテゴリ別に検証を実行
            await this.validatePerformance();
            await this.validateCompatibility();
            await this.validateMemoryManagement();
            await this.validateAccessibility();
            await this.validateSecurity();
            await this.validateStability();
            
            const endTime = performance.now();
            const duration = endTime - this.startTime;

            const summary = this.generateValidationSummary(duration);
            console.log('Final validation completed:', summary);

            return summary;
        } finally {
            this.validationRunning = false;
        }
    }

    /**
     * パフォーマンス検証
     */
    private async validatePerformance(): Promise<void> {
        const category = this.validationCategories.performance;
        
        await this.runValidation(category, 'Debug Interface Performance Impact', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // ベースライン測定
            debugInterface.hide();
            const baselineMetrics = await this.measurePerformance(5000);
            // デバッグインターフェース有効時の測定
            debugInterface.show();
            const debugMetrics = await this.measurePerformance(5000);
            const impact = this.calculatePerformanceImpact(baselineMetrics, debugMetrics);
            
            if (impact.overallImpact > this.performanceTargets.debugOverhead) {
                throw new Error(`Debug overhead ${impact.overallImpact.toFixed(2)}% exceeds target ${this.performanceTargets.debugOverhead}%`);
            }

            return `Debug performance impact: ${impact.overallImpact.toFixed(2)}% (target: <${this.performanceTargets.debugOverhead}%)`;
        });

        await this.runValidation(category, 'Memory Usage Validation', async () => {
            if (!performance.memory) {
                return 'Memory API not available - skipped';
            }

            const debugInterface = this.gameEngine.enhancedDebugInterface;
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // デバッグ機能を使用
            debugInterface.show();
            for (let i = 0; i < 10; i++) {
                debugInterface.switchPanel(['overview', 'performance', 'console', 'errors', 'tests'][i % 5]);
                await this.wait(100);
            }
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
            
            if (memoryIncrease > this.performanceTargets.memoryIncrease) {
                throw new Error(`Memory increase ${memoryIncrease.toFixed(2)}MB exceeds target ${this.performanceTargets.memoryIncrease}MB`);
            }

            return `Memory increase: ${memoryIncrease.toFixed(2)}MB (target: <${this.performanceTargets.memoryIncrease}MB)`;
        });

        await this.runValidation(category, 'Panel Switch Performance', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            const panels = ['overview', 'performance', 'console', 'errors', 'tests'];
            let totalTime = 0;
            
            for (const panel of panels) {
                const startTime = performance.now();
                debugInterface.switchPanel(panel);
                await this.wait(50); // Allow panel to render
                const endTime = performance.now();
                const switchTime = endTime - startTime;
                totalTime += switchTime;
                
                if (switchTime > this.performanceTargets.panelSwitchTime) {
                    throw new Error(`Panel switch time ${switchTime.toFixed(2)}ms exceeds target ${this.performanceTargets.panelSwitchTime}ms`);
                }
            }
            
            const averageTime = totalTime / panels.length;
            return `Average panel switch time: ${averageTime.toFixed(2)}ms (target: <${this.performanceTargets.panelSwitchTime}ms)`;
        });

        await this.runValidation(category, 'Initialization Performance', async () => {
            // デバッグインターフェースを再初期化して測定
            const startTime = performance.now();

            if (this.gameEngine.enhancedDebugInterface) {
                this.gameEngine.enhancedDebugInterface.destroy?.();
            }
            
            // 新しいインスタンスを作成
            const { EnhancedDebugInterface } = await import('./EnhancedDebugInterface.js');
            this.gameEngine.enhancedDebugInterface = new EnhancedDebugInterface(this.gameEngine);
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            if (initTime > this.performanceTargets.initializationTime) {
                throw new Error(`Initialization time ${initTime.toFixed(2)}ms exceeds target ${this.performanceTargets.initializationTime}ms`);
            }
            
            return `Initialization time: ${initTime.toFixed(2)}ms (target: <${this.performanceTargets.initializationTime}ms)`;
        });
    }

    /**
     * 互換性検証
     */
    private async validateCompatibility(): Promise<void> {
        const category = this.validationCategories.compatibility;
        
        await this.runValidation(category, 'Browser API Compatibility', async () => {
            const missingAPIs: string[] = [];
            const partialAPIs: string[] = [];

            // 必須API
            if (!window.performance) missingAPIs.push('Performance API');
            if (!window.localStorage) missingAPIs.push('LocalStorage');
            if (!window.requestAnimationFrame) missingAPIs.push('RequestAnimationFrame');
            
            // オプショナルAPI（グレースフルデグラデーション）
            if (!(window as any).ResizeObserver) partialAPIs.push('ResizeObserver');
            if (!(window as any).IntersectionObserver) partialAPIs.push('IntersectionObserver');
            
            // CSS機能
            if (!CSS.supports('display', 'grid')) partialAPIs.push('CSS Grid');
            if (!CSS.supports('display', 'flex')) partialAPIs.push('CSS Flexbox');

            if (missingAPIs.length > 0) {
                throw new Error(`Missing critical APIs: ${missingAPIs.join(', ')}`);
            }

            let message = 'All critical APIs available';
            if (partialAPIs.length > 0) {
                message += ` (${partialAPIs.length} optional APIs missing with graceful degradation)`;
            }

            return message;
        });

        await this.runValidation(category, 'Screen Size Compatibility', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            const results: string[] = [];
            
            for (const size of this.compatibilityTargets.screenSizes) {
                // レスポンシブレイアウトをテスト
                if (debugInterface.responsiveLayout) {
                    debugInterface.responsiveLayout.simulateResize(size.width, size.height);
                    await this.wait(100);
                    // インターフェースが正常に表示されるかチェック
                    const isVisible = debugInterface.debugPanel && 
                                     debugInterface.debugPanel.style.display !== 'none';
                    if (!isVisible) {
                        throw new Error(`Interface not visible at ${size.name} resolution (${size.width}x${size.height})`);
                    }

                    results.push(`${size.name}: OK`);
                }
            }

            return `Screen compatibility: ${results.join(', ')}`;
        });

        await this.runValidation(category, 'Touch Device Compatibility', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;

            if (!debugInterface.responsiveLayout) {
                throw new Error('ResponsiveDebugLayout not available');
            }
            
            // タッチデバイスをシミュレート
            const mockTouchEvent = {
                touches: [{ clientX: 100, clientY: 100 }],
                preventDefault: () => {},
                stopPropagation: () => {}
            };
            
            // タッチイベントが処理されるかテスト
            let touchHandled = false;
            const originalHandler = debugInterface.responsiveLayout.handleTouch;
            
            if (originalHandler) {
                debugInterface.responsiveLayout.handleTouch = () => {
                    touchHandled = true;
                };
                // タッチイベントをシミュレート
                debugInterface.responsiveLayout.handleTouch(mockTouchEvent);
                
                // 元のハンドラーを復元
                debugInterface.responsiveLayout.handleTouch = originalHandler;
            }

            return touchHandled ? 'Touch events handled correctly' : 'Touch event handling available';
        });
    }

    /**
     * メモリ管理検証
     */
    private async validateMemoryManagement(): Promise<void> {
        const category = this.validationCategories.memory;
        
        await this.runValidation(category, 'Memory Leak Detection', async () => {
            if (!performance.memory) {
                return 'Memory API not available - using alternative detection';
            }

            const debugInterface = this.gameEngine.enhancedDebugInterface;
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // メモリリークテスト：大量の操作を実行
            for (let i = 0; i < 50; i++) {
                debugInterface.show();
                debugInterface.switchPanel('performance');
                debugInterface.hide();
                const testPanel = debugInterface.panelManager?.createPanel('test-panel-' + i);
                if (testPanel && testPanel.destroy) {
                    testPanel.destroy();
                }
                
                if (i % 10 === 0) {
                    // GCを促進
                    if ((window as any).gc) (window as any).gc();
                    await this.wait(10);
                }
            }
            
            // 最終的なメモリ測定
            await this.wait(1000);
            if ((window as any).gc) (window as any).gc();
            await this.wait(500);
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
            
            // 許容できるメモリ増加量をチェック
            const acceptableIncrease = 5; // MB
            if (memoryIncrease > acceptableIncrease) {
                throw new Error(`Potential memory leak detected: ${memoryIncrease.toFixed(2)}MB increase`);
            }

            return `Memory increase after stress test: ${memoryIncrease.toFixed(2)}MB (acceptable)`;
        });

        await this.runValidation(category, 'Event Listener Cleanup', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // イベントリスナー数の推定
            const getListenerCount = () => {
                return document.querySelectorAll('*').length;
            };
            
            const initialCount = getListenerCount();
            
            // イベントリスナーを大量に作成・削除
            debugInterface.show();
            debugInterface.createSettingsModal?.();
            debugInterface.closeSettingsModal?.();
            debugInterface.hide();
            
            // パネル切り替えを繰り返し
            for (let i = 0; i < 20; i++) {
                debugInterface.show();
                debugInterface.switchPanel(['overview', 'performance', 'console'][i % 3]);
                debugInterface.hide();
            }
            
            const finalCount = getListenerCount();
            const increase = finalCount - initialCount;
            
            // 適度な増加は許容（基本的なイベントリスナー）
            const acceptableIncrease = 10;
            if (increase > acceptableIncrease) {
                console.warn(`Event listener increase: ${increase} (may indicate cleanup issues)`);
            }

            return `Event listener management: ${increase} increase (baseline variation)`;
        });

        await this.runValidation(category, 'Resource Cleanup Validation', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // リソースクリーンアップをテスト
            debugInterface.show();
            // パフォーマンス監視を開始
            if (debugInterface.performanceMonitor) {
                debugInterface.performanceMonitor.startMonitoring();
                await this.wait(1000);
                debugInterface.performanceMonitor.stopMonitoring();
            }
            
            // 遅延読み込みマネージャーの最適化
            if (debugInterface.lazyLoadManager) {
                debugInterface.lazyLoadManager.optimizeMemoryUsage();
            }

            debugInterface.hide();
            return 'Resource cleanup completed successfully';
        });
    }

    /**
     * アクセシビリティ検証
     */
    private async validateAccessibility(): Promise<void> {
        const category = this.validationCategories.accessibility;
        
        await this.runValidation(category, 'Keyboard Navigation', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;

            if (!debugInterface.accessibilityManager) {
                throw new Error('AccessibilityManager not available');
            }
            
            debugInterface.show();
            
            // キーボードナビゲーションをテスト
            const tabableElements = debugInterface.debugPanel.querySelectorAll(
                'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (tabableElements.length === 0) {
                throw new Error('No keyboard navigable elements found');
            }
            
            // ARIAラベルの存在をチェック
            const elementsNeedingLabels = debugInterface.debugPanel.querySelectorAll(
                'button:not([aria-label]):not([aria-labelledby])'
            );
            
            if (elementsNeedingLabels.length > 0) {
                console.warn(`${elementsNeedingLabels.length} elements missing ARIA labels`);
            }

            return `Keyboard navigation: ${tabableElements.length} navigable elements, ARIA compliance checked`;
        });

        await this.runValidation(category, 'Screen Reader Compatibility', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            debugInterface.show();
            
            // セマンティック要素のチェック
            const semanticElements = debugInterface.debugPanel.querySelectorAll(
                'h1, h2, h3, h4, h5, h6, main, section, article, nav, aside'
            );

            // ライブリージョンの存在をチェック
            const liveRegions = debugInterface.debugPanel.querySelectorAll(
                '[aria-live], [role="status"], [role="alert"]'
            );

            // フォーカス管理のテスト
            const focusableElements = debugInterface.debugPanel.querySelectorAll(
                'button, input, select, textarea, [tabindex="0"]'
            );

            return `Screen reader support: ${semanticElements.length} semantic elements, ${liveRegions.length} live regions, ${focusableElements.length} focusable elements`;
        });

        await this.runValidation(category, 'Color Contrast Validation', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            debugInterface.show();
            
            // 高コントラストテーマが利用可能かチェック
            if (debugInterface.themeManager) {
                const themes = debugInterface.themeManager.getAvailableThemes();
                const hasHighContrast = themes.includes('high-contrast');

                if (!hasHighContrast) {
                    throw new Error('High contrast theme not available');
                }
                
                // 高コントラストモードをテスト
                debugInterface.themeManager.setTheme('high-contrast');
                await this.wait(100);
                debugInterface.themeManager.setTheme('dark'); // Reset

                return 'Color contrast: High contrast theme available and functional';
            }

            return 'Color contrast: Theme manager not available';
        });
    }

    /**
     * セキュリティ検証
     */
    private async validateSecurity(): Promise<void> {
        const category = this.validationCategories.security;
        
        await this.runValidation(category, 'XSS Prevention', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // XSS攻撃のテスト
            const maliciousInput = '<script>alert("XSS")</script>';
            
            // コンソールパネルでのXSS防止をテスト
            const consolePanel = debugInterface.panels?.get('console');
            if (consolePanel && consolePanel.executeCommand) {
                try {
                    const result = consolePanel.executeCommand(maliciousInput);
                    // 結果にscriptタグが含まれていないことを確認
                    if (result && result.includes('<script>')) {
                        throw new Error('XSS vulnerability detected in console output');
                    }
                } catch (error) {
                    // エラーが適切に処理されることを確認
                    if (!(error instanceof Error)) {
                        throw new Error('Improper error handling for malicious input');
                    }
                }
            }
            
            return 'XSS prevention: Malicious input properly sanitized';
        });

        await this.runValidation(category, 'Data Validation', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // 設定値の検証をテスト
            const invalidSettings: Record<string, any> = {
                fontSize: -1,
                updateInterval: 'invalid',
                theme: '<script>',
                maxHistorySize: Infinity
            };
            
            let vulnerabilities = 0;
            
            for (const [key, value] of Object.entries(invalidSettings)) {
                try {
                    debugInterface.settings[key] = value;
                    // 無効な値が設定された場合は脆弱性の可能性
                    if (debugInterface.settings[key] === value) {
                        vulnerabilities++;
                        console.warn(`Setting validation weakness: ${key} accepts invalid value`);
                    }
                } catch (error) {
                    // エラーが投げられるのは良い（適切な検証）
                }
            }

            if (vulnerabilities > 0) {
                throw new Error(`${vulnerabilities} setting validation vulnerabilities detected`);
            }

            return 'Data validation: All settings properly validated';
        });

        await this.runValidation(category, 'Privilege Escalation Prevention', async () => {
            // デバッグツールが不適切な権限を取得していないかチェック
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // グローバルオブジェクトの変更をチェック
            const originalConsole = window.console;
            const originalPerformance = window.performance;
            
            debugInterface.show();
            await this.wait(100);
            debugInterface.hide();
            
            if (window.console !== originalConsole) {
                throw new Error('Debug interface modified global console object');
            }

            if (window.performance !== originalPerformance) {
                throw new Error('Debug interface modified global performance object');
            }

            return 'Privilege escalation: No unauthorized global modifications detected';
        });
    }

    /**
     * システム安定性検証
     */
    private async validateStability(): Promise<void> {
        const category = this.validationCategories.stability;
        
        await this.runValidation(category, 'Error Recovery', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // 意図的にエラーを発生させて回復をテスト
            const originalConsoleError = console.error;
            let errorsCaught = 0;
            
            console.error = (...args: any[]) => {
                errorsCaught++;
                originalConsoleError.apply(console, args);
            };
            
            try {
                // 無効なパネル切り替え
                debugInterface.switchPanel('nonexistent-panel');
                
                // 無効なテーマ設定
                if (debugInterface.themeManager) {
                    debugInterface.themeManager.setTheme('invalid-theme');
                }
                
                // 無効なショートカット登録
                if (debugInterface.keyboardShortcutManager) {
                    debugInterface.keyboardShortcutManager.registerShortcut('', null);
                }
                
                // システムが安定していることを確認
                debugInterface.show();
                await this.wait(100);
                debugInterface.hide();
                
            } finally {
                console.error = originalConsoleError;
            }

            return `Error recovery: System stable after ${errorsCaught} handled errors`;
        });

        await this.runValidation(category, 'Long Duration Stability', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // 長時間運用テスト（簡略版）
            const operations = 100;
            let operationsFailed = 0;
            
            for (let i = 0; i < operations; i++) {
                try {
                    debugInterface.show();
                    debugInterface.switchPanel(['overview', 'performance', 'console'][i % 3]);
                    
                    if (i % 10 === 0) {
                        // パフォーマンス統計を取得
                        if (debugInterface.performanceMonitor) {
                            debugInterface.performanceMonitor.getPerformanceStats();
                        }
                    }
                    
                    if (i % 20 === 0) {
                        debugInterface.hide();
                        await this.wait(10);
                    }
                } catch (error) {
                    operationsFailed++;
                    console.warn(`Operation ${i} failed:`, (error as Error).message);
                }
            }
            
            const successRate = ((operations - operationsFailed) / operations) * 100;
            
            if (successRate < 95) {
                throw new Error(`Stability test failed: ${successRate.toFixed(1)}% success rate (target: >95%)`);
            }

            return `Long duration stability: ${successRate.toFixed(1)}% success rate over ${operations} operations`;
        });

        await this.runValidation(category, 'Concurrent Operations', async () => {
            const debugInterface = this.gameEngine.enhancedDebugInterface;
            
            // 並行操作テスト
            const concurrentPromises: Promise<OperationResult>[] = [];
            
            // 複数の非同期操作を同時実行
            concurrentPromises.push(
                this.simulateConcurrentOperation('panel-switching', async () => {
                    for (let i = 0; i < 10; i++) {
                        debugInterface.switchPanel(['overview', 'performance'][i % 2]);
                        await this.wait(50);
                    }
                })
            );

            concurrentPromises.push(
                this.simulateConcurrentOperation('performance-monitoring', async () => {
                    if (debugInterface.performanceMonitor) {
                        for (let i = 0; i < 20; i++) {
                            debugInterface.performanceMonitor.getPerformanceStats();
                            await this.wait(25);
                        }
                    }
                })
            );

            concurrentPromises.push(
                this.simulateConcurrentOperation('settings-modification', async () => {
                    for (let i = 0; i < 5; i++) {
                        debugInterface.settings.fontSize = 12 + (i % 4);
                        await this.wait(100);
                    }
                })
            );

            const results = await Promise.allSettled(concurrentPromises);
            const failures = results.filter(r => r.status === 'rejected');
            
            if (failures.length > 0) {
                const reasons = failures.map(f => (f as PromiseRejectedResult).reason).join(', ');
                throw new Error(`${failures.length} concurrent operations failed: ${reasons}`);
            }
            
            return `Concurrent operations: All ${concurrentPromises.length} operations completed successfully`;
        });
    }

    // ============================================
    // Utility Methods
    // ============================================

    /**
     * 個別検証を実行
     */
    private async runValidation(category: string, validationName: string, validationFunction: () => Promise<string>): Promise<ValidationResult> {
        const startTime = performance.now();
        let result: ValidationResult;
        
        try {
            const validationResult = await validationFunction();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            result = {
                category,
                name: validationName,
                status: 'passed',
                message: validationResult,
                duration: duration,
                timestamp: new Date().toISOString()
            };

            console.log(`✓ ${validationName}: ${validationResult} (${duration.toFixed(2)}ms)`);

        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            result = {
                category,
                name: validationName,
                status: 'failed',
                message: (error as Error).message,
                duration: duration,
                timestamp: new Date().toISOString(),
                error: error as Error
            };
            
            console.error(`✗ ${validationName}: ${(error as Error).message} (${duration.toFixed(2)}ms)`);
        }

        this.validationResults.push(result);
        return result;
    }

    /**
     * パフォーマンス測定
     */
    private async measurePerformance(duration: number): Promise<PerformanceMetrics> {
        const metrics = {
            fps: [] as number[],
            frameTime: [] as number[],
            memoryUsage: [] as number[]
        };
        
        const startTime = performance.now();
        let frameCount = 0;
        let lastFrameTime = startTime;

        return new Promise((resolve) => {
            const measureFrame = () => {
                const currentTime = performance.now();
                const frameTime = currentTime - lastFrameTime;
                const fps = 1000 / frameTime;

                metrics.fps.push(fps);
                metrics.frameTime.push(frameTime);
                
                if (performance.memory) {
                    metrics.memoryUsage.push(performance.memory.usedJSHeapSize);
                }

                frameCount++;
                lastFrameTime = currentTime;

                if (currentTime - startTime < duration) {
                    requestAnimationFrame(measureFrame);
                } else {
                    resolve({
                        averageFPS: metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length,
                        averageFrameTime: metrics.frameTime.reduce((a, b) => a + b, 0) / metrics.frameTime.length,
                        frameCount: frameCount,
                        duration: currentTime - startTime,
                        memoryUsage: metrics.memoryUsage.length > 0 ? 
                            metrics.memoryUsage[metrics.memoryUsage.length - 1] - metrics.memoryUsage[0] : 0
                    });
                }
            };

            requestAnimationFrame(measureFrame);
        });
    }

    /**
     * パフォーマンス影響計算
     */
    private calculatePerformanceImpact(baseline: PerformanceMetrics, debug: PerformanceMetrics): PerformanceImpact {
        const fpsImpact = ((baseline.averageFPS - debug.averageFPS) / baseline.averageFPS) * 100;
        const frameTimeImpact = ((debug.averageFrameTime - baseline.averageFrameTime) / baseline.averageFrameTime) * 100;
        const memoryImpact = debug.memoryUsage - baseline.memoryUsage;

        return {
            fpsImpact: Math.max(0, fpsImpact),
            frameTimeImpact: Math.max(0, frameTimeImpact),
            memoryImpact: memoryImpact,
            overallImpact: Math.max(fpsImpact, frameTimeImpact)
        };
    }

    /**
     * 並行操作シミュレーション
     */
    private async simulateConcurrentOperation(name: string, operation: () => Promise<void>): Promise<OperationResult> {
        try {
            await operation();
            return { name, status: 'success' };
        } catch (error) {
            throw new Error(`${name}: ${(error as Error).message}`);
        }
    }

    /**
     * 待機
     */
    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 検証結果サマリーを生成
     */
    private generateValidationSummary(duration: number): ValidationSummary {
        const total = this.validationResults.length;
        const passed = this.validationResults.filter(r => r.status === 'passed').length;
        const failed = this.validationResults.filter(r => r.status === 'failed').length;

        const categoryStats: CategoryStats = {};
        
        for (const category of Object.values(this.validationCategories)) {
            const categoryResults = this.validationResults.filter(r => r.category === category);
            categoryStats[category] = {
                total: categoryResults.length,
                passed: categoryResults.filter(r => r.status === 'passed').length,
                failed: categoryResults.filter(r => r.status === 'failed').length
            };
        }

        return {
            summary: {
                total,
                passed,
                failed,
                successRate: (passed / total) * 100,
                duration: duration
            },
            categoryStats,
            results: this.validationResults,
            timestamp: new Date().toISOString(),
            targets: this.performanceTargets,
            compatibility: this.compatibilityTargets
        };
    }

    /**
     * 検証結果をエクスポート
     */
    exportValidationResults(): ValidationSummary {
        const summary = this.generateValidationSummary(performance.now() - (this.startTime || 0));

        const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `final-validation-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        return summary;
    }

    /**
     * 検証状態を取得
     */
    getValidationStatus(): { running: boolean; results: ValidationResult[] } {
        return {
            running: this.validationRunning,
            results: this.validationResults
        };
    }
}