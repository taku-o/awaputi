/**
 * Error Recovery Tracker
 * エラー復旧追跡システム - 自動復旧試行・成功率分析・復旧戦略評価
 */

interface ErrorReporter {
    gameEngine?: GameEngine;
    sessionStartTime: number;
}

interface GameEngine {
    cacheSystem?: { clearCache(): void; };
    objectPool?: { cleanup(): void; };
    particleManager?: { cleanup(): void; disable(): void; };
    canvas?: HTMLCanvasElement;
    renderOptimizer?: { reset(): void; };
    audioManager?: AudioManager;
    sceneManager?: SceneManager;
    enableSafeMode?(): void;
    effectManager?: { disable(): void; };
    playerData?: { enableFallbackMode(): void; };
    settingsManager?: { enableFallbackMode(): void; };
    bubbleManager?: any;
    scoreManager?: any;
    [key: string]: any;
}

interface AudioManager {
    stop(): Promise<void>;
    initialize(): Promise<void>;
    mute(): void;
}

interface SceneManager {
    currentScene: any;
    reloadCurrentScene(): Promise<void>;
}

interface RecoveryStrategy {
    name: string;
    description: string;
    triggers: string[];
    priority: number;
    action: (error: ErrorInfo, context: any) => Promise<RecoveryResult>;
}

interface ErrorInfo {
    id: string;
    message: string;
    category: string;
    severity: string;
    fingerprint: string;
}

interface RecoveryResult {
    success: boolean;
    reason?: string;
    details?: string;
}

interface RecoverySession {
    id: string;
    startTime: number;
    error: {
        id: string;
        message: string;
        category: string;
        severity: string;
        fingerprint: string;
    };
    context: any;
    strategiesAttempted: StrategyAttempt[];
    success: boolean;
    endTime: number | null;
    duration: number;
    result: string | null;
}

interface StrategyAttempt {
    id: string;
    name: string;
    startTime: number;
    success: boolean;
    error: string | null;
    duration: number;
}

interface RecoveryConfig {
    enabled: boolean;
    maxAttemptsPerError: number;
    maxAttemptsPerStrategy: number;
    cooldownPeriod: number;
    timeoutDuration: number;
    enablePreventiveRecovery: boolean;
    enableLearning: boolean;
}

interface StrategyStats {
    attempts: number;
    successes: number;
    failures: number;
    averageDuration: number;
}

interface CategoryStats {
    attempts: number;
    successes: number;
    failures: number;
}

interface RecoveryStats {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    byStrategy: Map<string, StrategyStats>;
    byErrorCategory: Map<string, CategoryStats>;
    averageRecoveryTime: number;
    recentSuccessRate: number;
}

interface LearningData {
    strategyEffectiveness: Map<string, number[]>;
    contextualPatterns: Map<string, any>;
    timeBasedPatterns: Map<string, any>;
}

interface RecoveryReport {
    timeframe: string;
    generatedAt: number;
    summary: {
        totalAttempts: number;
        successfulRecoveries: number;
        successRate: string;
        averageRecoveryTime: string;
    };
    strategyAnalysis: StrategyPerformance[];
    categoryAnalysis: CategoryPerformance[];
    recommendations: RecoveryRecommendation[];
}

interface StrategyPerformance {
    strategyId: string;
    name: string;
    attempts: number;
    successes: number;
    averageDuration: number;
    totalDuration: number;
    successRate: string;
}

interface CategoryPerformance {
    category: string;
    attempts: number;
    successes: number;
    averageDuration: number;
    totalDuration: number;
    successRate: string;
}

interface RecoveryRecommendation {
    type: "single" | "batch";
    priority: string;
    message: string;
    action: string;
    strategies?: string[];
    categories?: string[];
}

type TimeframeType = 'session' | 'last_hour' | 'last_day';
export class ErrorRecoveryTracker {
    private errorReporter: ErrorReporter;
    private recoveryStrategies: Map<string, RecoveryStrategy>;
    private recoveryAttempts: RecoverySession[];
    private maxRecoveryHistory: number;
    private recoveryStats: RecoveryStats;
    private recoveryConfig: RecoveryConfig;
    private learningData: LearningData;
    private activeRecoveries: Map<string, RecoverySession>;
    private cooldownTimers: Map<string, number>;
    constructor(errorReporter: ErrorReporter) {
        this.errorReporter = errorReporter;
        
        // 復旧戦略の定義
        this.recoveryStrategies = new Map([
            ['memory_cleanup', {
                name: 'Memory Cleanup',
                description: 'メモリクリーンアップとガベージコレクション',
                triggers: ['memory', 'allocation'],
                priority: 1,
                action: this.performMemoryCleanup.bind(this)
            }],
            ['canvas_reset', {
                name: 'Canvas Reset',
                description: 'Canvas コンテキストのリセット',
                triggers: ['rendering', 'canvas'],
                priority: 2,
                action: this.performCanvasReset.bind(this)
            }],
            ['audio_restart', {
                name: 'Audio Restart',
                description: 'オーディオシステムの再起動',
                triggers: ['audio', 'sound'],
                priority: 2,
                action: this.performAudioRestart.bind(this)
            }],
            ['storage_fallback', {
                name: 'Storage Fallback',
                description: 'ストレージの代替手段への切り替え',
                triggers: ['storage', 'localstorage'],
                priority: 3,
                action: this.performStorageFallback.bind(this)
            }],
            ['scene_reload', {
                name: 'Scene Reload',
                description: '現在のシーンの再読み込み',
                triggers: ['scene', 'navigation'],
                priority: 3,
                action: this.performSceneReload.bind(this)
            }],
            ['safe_mode', {
                name: 'Safe Mode',
                description: 'セーフモードへの切り替え',
                triggers: ['critical', 'system'],
                priority: 4,
                action: this.performSafeModeSwitch.bind(this)
            }],
            ['component_restart', {
                name: 'Component Restart',
                description: '特定コンポーネントの再起動',
                triggers: ['component', 'module'],
                priority: 2,
                action: this.performComponentRestart.bind(this)
            }]
        ]);
        
        // 復旧試行履歴
        this.recoveryAttempts = [];
        this.maxRecoveryHistory = 1000;
        
        // 復旧統計
        this.recoveryStats = {
            totalAttempts: 0,
            successfulRecoveries: 0,
            failedRecoveries: 0,
            byStrategy: new Map(),
            byErrorCategory: new Map(),
            averageRecoveryTime: 0,
            recentSuccessRate: 0
        };
        
        // 復旧設定
        this.recoveryConfig = {
            enabled: true,
            maxAttemptsPerError: 3,
            maxAttemptsPerStrategy: 2,
            cooldownPeriod: 300000, // 5分
            timeoutDuration: 10000, // 10秒
            enablePreventiveRecovery: true,
            enableLearning: true
        };
        
        // 復旧学習システム
        this.learningData = {
            strategyEffectiveness: new Map(),
            contextualPatterns: new Map(),
            timeBasedPatterns: new Map()
        };
        
        // 復旧状態管理
        this.activeRecoveries = new Map();
        this.cooldownTimers = new Map();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void {
        this.loadRecoveryData();
        this.setupPeriodicAnalysis();
        console.log('ErrorRecoveryTracker initialized');
    }
    
    /**
     * エラーに対する復旧の試行
     */
    public async attemptRecovery(error: ErrorInfo, context: any = {}): Promise<{ success: boolean; reason?: string; sessionId?: string; duration?: number; strategiesAttempted?: number; result?: string; }> {
        if (!this.recoveryConfig.enabled) {
            return { success: false, reason: 'Recovery disabled' };
        }
        
        // 復旧試行の記録を開始
        const recoverySession = this.startRecoverySession(error, context);
        
        try {
            // 適用可能な復旧戦略を選択
            const strategies = this.selectRecoveryStrategies(error, context);
            if (strategies.length === 0) {
                return this.completeRecoverySession(recoverySession, false, 'No applicable strategies');
            }
            
            // 戦略を順次実行
            for (const strategy of strategies) {
                if (await this.executeRecoveryStrategy(strategy, error, context, recoverySession)) {
                    return this.completeRecoverySession(recoverySession, true, `Recovered using ${strategy.name}`);
                }
            }

            return this.completeRecoverySession(recoverySession, false, 'All strategies failed');

        } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError);
            return this.completeRecoverySession(recoverySession, false, `Recovery error: ${(recoveryError as Error).message}`);
        }
    }
    /**
     * 復旧セッションの開始
     */
    private startRecoverySession(error: ErrorInfo, context: any): RecoverySession {
        const session: RecoverySession = {
            id: this.generateRecoveryId(),
            startTime: Date.now(),
            error: {
                id: error.id,
                message: error.message,
                category: error.category,
                severity: error.severity,
                fingerprint: error.fingerprint
            },
            context,
            strategiesAttempted: [],
            success: false,
            endTime: null,
            duration: 0,
            result: null
        };
        
        this.activeRecoveries.set(session.id, session);
        this.recoveryStats.totalAttempts++;
        
        console.log(`🔧 Starting recovery session ${session.id} for error: ${error.message}`);
        return session;
    }
    
    /**
     * 復旧戦略の選択
     */
    private selectRecoveryStrategies(error: ErrorInfo, context: any): Array<RecoveryStrategy & { id: string; effectiveness?: number; }> {
        const applicableStrategies: Array<RecoveryStrategy & { id: string; effectiveness?: number; }> = [];
        
        // エラーカテゴリに基づく戦略選択
        for (const [strategyId, strategy] of Array.from(this.recoveryStrategies.entries())) {
            if (this.isStrategyApplicable(strategy, error, context)) {
                // 冷却期間チェック
                if (this.isStrategyCooledDown(strategyId, error.fingerprint)) {
                    // 最大試行回数チェック
                    if (this.canAttemptStrategy(strategyId, error.fingerprint)) {
                        applicableStrategies.push({
                            id: strategyId,
                            ...strategy,
                            effectiveness: this.getStrategyEffectiveness(strategyId, error.category)
                        });
                    }
                }
            }
        }
        
        // 優先度と効果度で並べ替え
        return applicableStrategies.sort((a, b) => {
            const priorityDiff = a.priority - b.priority;
            if (priorityDiff !== 0) return priorityDiff;
            return (b.effectiveness || 0.5) - (a.effectiveness || 0.5);
        });
    }
    
    /**
     * 復旧戦略の適用可能性チェック
     */
    private isStrategyApplicable(strategy: RecoveryStrategy, error: ErrorInfo, _context: any): boolean {
        // トリガーワードの確認
        const errorText = `${error.message} ${error.category}`.toLowerCase();
        
        return strategy.triggers.some(trigger => 
            errorText.includes(trigger.toLowerCase())
        );
    }
    
    /**
     * 戦略の冷却期間チェック
     */
    private isStrategyCooledDown(strategyId: string, errorFingerprint: string): boolean {
        const cooldownKey = `${strategyId}_${errorFingerprint}`;
        const cooldownTimer = this.cooldownTimers.get(cooldownKey);
        
        if (!cooldownTimer) return true;
        
        return Date.now() > cooldownTimer;
    }
    
    /**
     * 戦略の試行可能性チェック
     */
    private canAttemptStrategy(strategyId: string, errorFingerprint: string): boolean {
        const recentAttempts = this.recoveryAttempts.filter(attempt =>
            attempt.strategiesAttempted.some(s => s.id === strategyId) &&
            attempt.error.fingerprint === errorFingerprint &&
            Date.now() - attempt.startTime < this.recoveryConfig.cooldownPeriod
        );
        
        return recentAttempts.length < this.recoveryConfig.maxAttemptsPerStrategy;
    }
    
    /**
     * 復旧戦略の実行
     */
    private async executeRecoveryStrategy(
        strategy: RecoveryStrategy & { id: string },
        error: ErrorInfo,
        context: any,
        session: RecoverySession
    ): Promise<boolean> {
        const strategyAttempt: StrategyAttempt = {
            id: strategy.id,
            name: strategy.name,
            startTime: Date.now(),
            success: false,
            error: null,
            duration: 0
        };
        session.strategiesAttempted.push(strategyAttempt);
        
        console.log(`🔧 Executing recovery strategy: ${strategy.name}`);
        
        try {
            // タイムアウト付きで戦略を実行
            const result = await Promise.race([
                strategy.action(error, context),
                this.createTimeoutPromise(this.recoveryConfig.timeoutDuration)
            ]);
            
            strategyAttempt.duration = Date.now() - strategyAttempt.startTime;
            strategyAttempt.success = result.success;
            
            if (result.success) {
                console.log(`✅ Recovery strategy ${strategy.name} succeeded`);
                this.recordStrategySuccess(strategy.id, error.category, strategyAttempt.duration);
                return true;
            } else {
                console.log(`❌ Recovery strategy ${strategy.name} failed: ${result.reason}`);
                this.recordStrategyFailure(strategy.id, error.category, result.reason || 'Unknown failure');
            }
        } catch (strategyError) {
            strategyAttempt.duration = Date.now() - strategyAttempt.startTime;
            strategyAttempt.error = (strategyError as Error).message;
            console.error(`❌ Recovery strategy ${strategy.name} threw error:`, strategyError);
            this.recordStrategyFailure(strategy.id, error.category, (strategyError as Error).message);
        }
        
        // 戦略実行後の冷却期間を設定
        this.setCooldown(strategy.id, error.fingerprint);
        
        return false;
    }
    
    /**
     * 復旧セッションの完了
     */
    private completeRecoverySession(session: RecoverySession, success: boolean, result: string): { success: boolean; sessionId: string; duration: number; strategiesAttempted: number; result: string; } {
        session.success = success;
        session.result = result;
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        
        // 統計を更新
        if (success) {
            this.recoveryStats.successfulRecoveries++;
        } else {
            this.recoveryStats.failedRecoveries++;
        }
        
        // 履歴に追加
        this.recoveryAttempts.push({ ...session });
        
        // 履歴サイズ制限
        if (this.recoveryAttempts.length > this.maxRecoveryHistory) {
            this.recoveryAttempts.shift();
        }
        
        // アクティブセッションから削除
        this.activeRecoveries.delete(session.id);
        
        // 学習データを更新
        if (this.recoveryConfig.enableLearning) {
            this.updateLearningData(session);
        }

        console.log(`🔧 Recovery session ${session.id} completed: ${success ? '✅ SUCCESS' : '❌ FAILED'} - ${result}`);
        return {
            success,
            sessionId: session.id,
            duration: session.duration,
            strategiesAttempted: session.strategiesAttempted.length,
            result
        };
    }
    
    /**
     * 復旧戦略の実装群
     */
    private async performMemoryCleanup(_error: ErrorInfo, _context: any): Promise<RecoveryResult> {
        try {
            // ガベージコレクションの実行（可能な場合）
            if ((window as any).gc) {
                (window as any).gc();
            }
            
            // メモリ使用量の確認
            const memoryBefore = this.getMemoryUsage();
            
            // キャッシュのクリア
            if (this.errorReporter.gameEngine?.cacheSystem) {
                this.errorReporter.gameEngine.cacheSystem.clearCache();
            }
            
            // オブジェクトプールのクリーンアップ
            if (this.errorReporter.gameEngine?.objectPool) {
                this.errorReporter.gameEngine.objectPool.cleanup();
            }
            
            // パーティクルシステムのクリーンアップ
            if (this.errorReporter.gameEngine?.particleManager) {
                this.errorReporter.gameEngine.particleManager.cleanup();
            }
            
            // メモリ使用量の再確認
            const memoryAfter = this.getMemoryUsage();
            const improvement = memoryBefore && memoryAfter ? 
                ((memoryBefore - memoryAfter) / memoryBefore * 100).toFixed(2) : 0;
            
            return {
                success: true,
                details: `Memory cleanup completed. Improved by ${improvement}%`
            };
        } catch (cleanupError) {
            return {
                success: false,
                reason: `Memory cleanup failed: ${(cleanupError as Error).message}`
            };
        }
    }
    
    private async performCanvasReset(_error: ErrorInfo, _context: any): Promise<RecoveryResult> {
        try {
            const gameEngine = this.errorReporter.gameEngine;
            if (!gameEngine?.canvas) {
                return { success: false, reason: 'Canvas not available' };
            }
            
            // Canvas コンテキストの取得
            const ctx = gameEngine.canvas.getContext('2d');
            if (!ctx) {
                return { success: false, reason: 'Cannot get 2D context' };
            }
            
            // Canvas の状態をリセット
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, gameEngine.canvas.width, gameEngine.canvas.height);
            ctx.restore();
            
            // レンダリングシステムの再初期化
            if (gameEngine.renderOptimizer) {
                gameEngine.renderOptimizer.reset();
            }

            return {
                success: true,
                details: 'Canvas reset completed successfully'
            };
        } catch (resetError) {
            return {
                success: false,
                reason: `Canvas reset failed: ${(resetError as Error).message}`
            };
        }
    }
    
    private async performAudioRestart(_error: ErrorInfo, _context: any): Promise<RecoveryResult> {
        try {
            const gameEngine = this.errorReporter.gameEngine;
            if (!gameEngine?.audioManager) {
                return { success: false, reason: 'AudioManager not available' };
            }
            
            // オーディオコンテキストの停止
            await gameEngine.audioManager.stop();
            
            // 短時間待機
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // オーディオシステムの再起動
            await gameEngine.audioManager.initialize();

            return {
                success: true,
                details: 'Audio system restarted successfully'
            };
        } catch (restartError) {
            return {
                success: false,
                reason: `Audio restart failed: ${(restartError as Error).message}`
            };
        }
    }
    
    private async performStorageFallback(_error: ErrorInfo, _context: any): Promise<RecoveryResult> {
        try {
            const gameEngine = this.errorReporter.gameEngine;
            
            // インメモリストレージへの切り替え
            if (gameEngine?.playerData) {
                gameEngine.playerData.enableFallbackMode();
            }
            
            // 設定管理システムのフォールバック
            if (gameEngine?.settingsManager) {
                gameEngine.settingsManager.enableFallbackMode();
            }

            return {
                success: true,
                details: 'Storage fallback mode enabled'
            };
        } catch (fallbackError) {
            return {
                success: false,
                reason: `Storage fallback failed: ${(fallbackError as Error).message}`
            };
        }
    }
    
    private async performSceneReload(_error: ErrorInfo, _context: any): Promise<RecoveryResult> {
        try {
            const gameEngine = this.errorReporter.gameEngine;
            if (!gameEngine?.sceneManager) {
                return { success: false, reason: 'SceneManager not available' };
            }

            const currentScene = gameEngine.sceneManager.currentScene;
            if (!currentScene) {
                return { success: false, reason: 'No current scene to reload' };
            }
            
            // 現在のシーンの名前を記録
            const sceneName = currentScene.constructor.name;
            
            // シーンの再読み込み
            await gameEngine.sceneManager.reloadCurrentScene();
            
            return {
                success: true,
                details: `Scene ${sceneName} reloaded successfully`
            };
        } catch (reloadError) {
            return {
                success: false,
                reason: `Scene reload failed: ${(reloadError as Error).message}`
            };
        }
    }
    
    private async performSafeModeSwitch(_error: ErrorInfo, _context: any): Promise<RecoveryResult> {
        try {
            const gameEngine = this.errorReporter.gameEngine;
            
            // セーフモードの有効化
            if (gameEngine?.enableSafeMode) {
                gameEngine.enableSafeMode();
            }
            
            // エフェクトの無効化
            if (gameEngine?.effectManager) {
                gameEngine.effectManager.disable();
            }
            
            // パーティクルシステムの無効化
            if (gameEngine?.particleManager) {
                gameEngine.particleManager.disable();
            }
            
            // オーディオの無効化
            if (gameEngine?.audioManager) {
                gameEngine.audioManager.mute();
            }

            return {
                success: true,
                details: 'Safe mode activated successfully'
            };
        } catch (safeModeError) {
            return {
                success: false,
                reason: `Safe mode switch failed: ${(safeModeError as Error).message}`
            };
        }
    }
    
    private async performComponentRestart(error: ErrorInfo, context: any): Promise<RecoveryResult> {
        try {
            const gameEngine = this.errorReporter.gameEngine;
            const componentName = this.identifyProblemComponent(error, context);
            if (!componentName) {
                return { success: false, reason: 'Could not identify problem component' };
            }
            
            // コンポーネントの再起動
            const component = gameEngine?.[componentName];
            if (component && typeof component.restart === 'function') {
                await component.restart();
            } else if (component && typeof component.initialize === 'function') {
                await component.initialize();
            } else {
                return { success: false, reason: `Component ${componentName} cannot be restarted` };
            }
                
            return {
                success: true, 
                details: `Component ${componentName} re-initialized successfully`
            };
        } catch (restartError) {
            return {
                success: false,
                reason: `Component restart failed: ${(restartError as Error).message}`
            };
        }
    }
    
    /**
     * ユーティリティメソッド群
     */
    private identifyProblemComponent(error: ErrorInfo, _context: any): string | null {
        const message = error.message.toLowerCase();
        const category = error.category.toLowerCase();
        
        if (message.includes('bubble') || category.includes('bubble')) {
            return 'bubbleManager';
        }

        if (message.includes('score') || category.includes('score')) {
            return 'scoreManager';
        }

        if (message.includes('audio') || category.includes('audio')) {
            return 'audioManager';
        }

        if (message.includes('render') || category.includes('render')) {
            return 'renderOptimizer';
        }
        
        return null as any;
    }
    
    private getMemoryUsage(): number | null {
        if ((performance as any).memory) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return null as any;
    }
    
    private createTimeoutPromise(duration: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Recovery strategy timeout')), duration);
        });
    }
    
    private setCooldown(strategyId: string, errorFingerprint: string): void {
        const cooldownKey = `${strategyId}_${errorFingerprint}`;
        const cooldownEnd = Date.now() + this.recoveryConfig.cooldownPeriod;
        this.cooldownTimers.set(cooldownKey, cooldownEnd);
    }
    
    private recordStrategySuccess(strategyId: string, errorCategory: string, duration: number): void {
        // 戦略別統計
        if (!this.recoveryStats.byStrategy.has(strategyId)) {
            this.recoveryStats.byStrategy.set(strategyId, {
                attempts: 0,
                successes: 0,
                failures: 0,
                averageDuration: 0
            });
        }
        
        const strategyStats = this.recoveryStats.byStrategy.get(strategyId)!;
        strategyStats.attempts++;
        strategyStats.successes++;
        strategyStats.averageDuration = 
            (strategyStats.averageDuration * (strategyStats.attempts - 1) + duration) / strategyStats.attempts;
        
        // カテゴリ別統計
        if (!this.recoveryStats.byErrorCategory.has(errorCategory)) {
            this.recoveryStats.byErrorCategory.set(errorCategory, {
                attempts: 0,
                successes: 0,
                failures: 0
            });
        }
        
        const categoryStats = this.recoveryStats.byErrorCategory.get(errorCategory)!;
        categoryStats.attempts++;
        categoryStats.successes++;
    }
    
    private recordStrategyFailure(strategyId: string, errorCategory: string, _reason: string): void {
        // 戦略別統計
        if (!this.recoveryStats.byStrategy.has(strategyId)) {
            this.recoveryStats.byStrategy.set(strategyId, {
                attempts: 0,
                successes: 0,
                failures: 0,
                averageDuration: 0
            });
        }
        
        const strategyStats = this.recoveryStats.byStrategy.get(strategyId)!;
        strategyStats.attempts++;
        strategyStats.failures++;
        
        // カテゴリ別統計
        if (!this.recoveryStats.byErrorCategory.has(errorCategory)) {
            this.recoveryStats.byErrorCategory.set(errorCategory, {
                attempts: 0,
                successes: 0,
                failures: 0
            });
        }
        
        const categoryStats = this.recoveryStats.byErrorCategory.get(errorCategory)!;
        categoryStats.attempts++;
        categoryStats.failures++;
    }
    
    private getStrategyEffectiveness(strategyId: string, _errorCategory: string): number {
        const strategyStats = this.recoveryStats.byStrategy.get(strategyId);
        if (!strategyStats || strategyStats.attempts === 0) {
            return 0.5; // デフォルト値
        }
        
        return strategyStats.successes / strategyStats.attempts;
    }
    
    private updateLearningData(session: RecoverySession): void {
        // 戦略効果の学習
        const effectiveness = session.success ? 1 : 0;
        const key = `${session.strategiesAttempted[0]?.id}_${session.error.category}`;
        
        if (!this.learningData.strategyEffectiveness.has(key)) {
            this.learningData.strategyEffectiveness.set(key, []);
        }
        
        const data = this.learningData.strategyEffectiveness.get(key)!;
        data.push(effectiveness);
        
        // 最新100件のみ保持
        if (data.length > 100) {
            data.shift();
        }
    }
    
    private generateRecoveryId(): string {
        return 'recovery_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 分析・レポート機能
     */
    public generateRecoveryReport(timeframe: TimeframeType = 'session'): RecoveryReport {
        const recentRecoveries = this.getRecoveriesForTimeframe(timeframe);
        
        return {
            timeframe,
            generatedAt: Date.now(),
            summary: {
                totalAttempts: recentRecoveries.length,
                successfulRecoveries: recentRecoveries.filter(r => r.success).length,
                successRate: recentRecoveries.length > 0 ? 
                    (recentRecoveries.filter(r => r.success).length / recentRecoveries.length * 100).toFixed(2) + '%' : '0%',
                averageRecoveryTime: this.calculateAverageRecoveryTime(recentRecoveries)
            },
            strategyAnalysis: this.analyzeStrategyPerformance(recentRecoveries),
            categoryAnalysis: this.analyzeCategoryPerformance(recentRecoveries),
            recommendations: this.generateRecoveryRecommendations(recentRecoveries)
        };
    }
    
    private getRecoveriesForTimeframe(timeframe: TimeframeType): RecoverySession[] {
        const now = Date.now();
        let timeLimit = 0;

        switch(timeframe) {
            case 'last_hour':
                timeLimit = now - 3600000;
                break;
            case 'last_day':
                timeLimit = now - 86400000;
                break;
            case 'session':
            default:
                timeLimit = this.errorReporter.sessionStartTime;
                break;
        }
        
        return this.recoveryAttempts.filter(recovery => recovery.startTime >= timeLimit);
    }
    
    private calculateAverageRecoveryTime(recoveries: RecoverySession[]): string {
        if (recoveries.length === 0) return '0ms';
        
        const totalTime = recoveries.reduce((sum, recovery) => sum + recovery.duration, 0);
        return (totalTime / recoveries.length).toFixed(0) + 'ms';
    }
    private analyzeStrategyPerformance(recoveries: RecoverySession[]): StrategyPerformance[] {
        const strategyPerformance = new Map<string, {
            name: string;
            attempts: number;
            successes: number;
            averageDuration: number;
            totalDuration: number;
        }>();
        
        recoveries.forEach(recovery => {
            recovery.strategiesAttempted.forEach(strategy => {
                if (!strategyPerformance.has(strategy.id)) {
                    strategyPerformance.set(strategy.id, {
                        name: strategy.name,
                        attempts: 0,
                        successes: 0,
                        averageDuration: 0,
                        totalDuration: 0
                    });
                }
                
                const perf = strategyPerformance.get(strategy.id)!;
                perf.attempts++;
                perf.totalDuration += strategy.duration;
                perf.averageDuration = perf.totalDuration / perf.attempts;
                
                if (strategy.success) {
                    perf.successes++;
                }
            });
        });
        
        return Array.from(strategyPerformance.entries()).map(([id, data]) => ({
            strategyId: id,
            ...data,
            successRate: data.attempts > 0 ? (data.successes / data.attempts * 100).toFixed(2) + '%' : '0%'
        }));
    }
    
    private analyzeCategoryPerformance(recoveries: RecoverySession[]): CategoryPerformance[] {
        const categoryPerformance = new Map<string, {
            attempts: number;
            successes: number;
            averageDuration: number;
            totalDuration: number;
        }>();
        
        recoveries.forEach(recovery => {
            const category = recovery.error.category;
            if (!categoryPerformance.has(category)) {
                categoryPerformance.set(category, {
                    attempts: 0,
                    successes: 0,
                    averageDuration: 0,
                    totalDuration: 0
                });
            }
            
            const perf = categoryPerformance.get(category)!;
            perf.attempts++;
            perf.totalDuration += recovery.duration;
            perf.averageDuration = perf.totalDuration / perf.attempts;
            
            if (recovery.success) {
                perf.successes++;
            }
        });
        
        return Array.from(categoryPerformance.entries()).map(([category, data]) => ({
            category,
            ...data,
            successRate: data.attempts > 0 ? (data.successes / data.attempts * 100).toFixed(2) + '%' : '0%'
        }));
    }
    
    private generateRecoveryRecommendations(recoveries: RecoverySession[]): RecoveryRecommendation[] {
        const recommendations: RecoveryRecommendation[] = [];
        
        // 低い成功率の戦略を特定
        const strategyAnalysis = this.analyzeStrategyPerformance(recoveries);
        const lowPerformanceStrategies = strategyAnalysis.filter(s => 
            s.attempts > 5 && parseFloat(s.successRate) < 30
        );

        if (lowPerformanceStrategies.length > 0) {
            recommendations.push({
                type: 'strategy_optimization',
                priority: 'high',
                message: `${lowPerformanceStrategies.length}個の復旧戦略が低い成功率を示しています`,
                action: '戦略の見直しまたは無効化を検討してください',
                strategies: lowPerformanceStrategies.map(s => s.name)
            });
        }
        
        // 復旧できないエラーカテゴリを特定
        const categoryAnalysis = this.analyzeCategoryPerformance(recoveries);
        const unrecoverableCategories = categoryAnalysis.filter(c => 
            c.attempts > 3 && parseFloat(c.successRate) === 0
        );

        if (unrecoverableCategories.length > 0) {
            recommendations.push({
                type: 'category_strategy',
                priority: 'medium',
                message: `${unrecoverableCategories.length}個のエラーカテゴリで復旧が困難です`,
                action: '新しい復旧戦略の開発を検討してください',
                categories: unrecoverableCategories.map(c => c.category)
            });
        }
        
        return recommendations;
    }
    
    /**
     * 設定・データ管理
     */
    private setupPeriodicAnalysis(): void {
        // 1時間ごとに統計を更新
        setInterval(() => {
            this.updateRecoveryStatistics();
        }, 3600000);
    }
    
    private updateRecoveryStatistics(): void {
        const recentRecoveries = this.recoveryAttempts.filter(r => 
            Date.now() - r.startTime < 3600000 // 過去1時間
        );
        
        if (recentRecoveries.length > 0) {
            this.recoveryStats.recentSuccessRate = 
                recentRecoveries.filter(r => r.success).length / recentRecoveries.length;
        }
        
        this.recoveryStats.averageRecoveryTime = parseFloat(this.calculateAverageRecoveryTime(this.recoveryAttempts));
    }

    private loadRecoveryData(): void {
        try {
            const stored = localStorage.getItem('error_recovery_data');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.recoveryStats) {
                    Object.assign(this.recoveryStats, data.recoveryStats);
                }
            }
        } catch (error) {
            console.warn('Failed to load recovery data:', (error as Error).message);
        }
    }
    
    private saveRecoveryData(): void {
        try {
            const dataToSave = {
                recoveryStats: this.recoveryStats,
                lastUpdated: Date.now()
            };
            localStorage.setItem('error_recovery_data', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save recovery data:', (error as Error).message);
        }
    }
    
    public updateConfiguration(newConfig: Partial<RecoveryConfig>): void {
        Object.assign(this.recoveryConfig, newConfig);
        console.log('Recovery configuration updated:', newConfig);
    }
    
    /**
     * クリーンアップ
     */
    public destroy(): void {
        this.saveRecoveryData();
        
        // アクティブな復旧セッションをキャンセル
        for (const session of Array.from(this.activeRecoveries.values())) {
            console.log(`Cancelling active recovery session: ${session.id}`);
        }

        this.activeRecoveries.clear();
        this.cooldownTimers.clear();
        console.log('ErrorRecoveryTracker destroyed');
    }
}

export default ErrorRecoveryTracker;