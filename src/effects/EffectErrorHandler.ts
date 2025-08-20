/**
 * Effect Error Handler
 * エフェクトシステム専用のエラーハンドリングとフォールバック機能
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

// Type definitions for effect error handling systems
interface GameEngine { canvas?: HTMLCanvasElement;
    performanceOptimizer?: PerformanceOptimizer;
    enhancedParticleManager?: EnhancedParticleManager;
    enhancedEffectManager?: EnhancedEffectManager;
    effectQualityController?: EffectQualityController;
    effectPerformanceOptimizer?: EffectPerformanceOptimizer;
    seasonalEffectManager?: SeasonalEffectManager;
    animationManager?: AnimationManager;
    poolManager?: PoolManager;
    particleManager?: ParticleManager;
    effectManager?: EffectManager;
    effectDebugInterface?: EffectDebugInterface;
    }
}

interface ErrorHandler { handleError(error: Error, context: string | ErrorContext): void,
    logError(error: Error, context: ErrorContext): void }
}

interface ErrorContext { component?: string;
    source?: string;
    context?: string; }
}

interface PerformanceOptimizer { getCurrentFPS(): number; }
}

interface EnhancedParticleManager { getActiveParticleCount(): number;
    forceCleanup(): void;
    clearAllParticles(): void;
    resetSystem(): void;
    setEnabled(enabled: boolean): void,
    pause(): void;
    resume(): void;
    reinitialize(): void; }
}

interface EnhancedEffectManager { getActiveEffectCount(): number;
    clearCache(): void;
    clearAllEffects(): void;
    setEnabled(enabled: boolean): void,
    pause(): void;
    resume(): void;
    reinitialize(): void;
    resetRenderingState(): void; }
}

interface EffectQualityController { getCurrentQualityLevel(): string;
    setQualityLevel(level: string): void, }
}

interface EffectPerformanceOptimizer { updateSettings(settings: any): void,
    manualOptimization(): void;
    emergencyOptimization(): void; }
}

interface SeasonalEffectManager { setEnabled(enabled: boolean): void, }
}

interface AnimationManager { setEnabled(enabled: boolean): void,
    clearAllAnimations(): void }
}

interface PoolManager { cleanup(): void; }
}

interface ParticleManager { setEnabled(enabled: boolean): void,
    setMaxParticles(max: number): void, }
}

interface EffectManager { setEnabled(enabled: boolean): void,
    setSimpleMode(enabled: boolean): void, }
}
';'
interface EffectDebugInterface { ''
    showWarning(message: string'): void, }
}

interface ErrorInfo { error: Error,
    source: string,
    timestamp: number,
    context: ErrorContextInfo
    }
}

interface ErrorContextInfo { fallbackMode: boolean,
    fps: number,
    particleCount: number,
    effectCount: number,
    memoryUsage: number,
    qualityLevel: string }
}

interface ErrorStats { totalErrors: number,
    fallbackMode: boolean,
    recentErrors: ErrorInfo[],
    healthStatus: HealthStatus
    }
}'
'';
type HealthStatus = 'healthy' | 'caution' | 'warning' | 'fallback';

export class EffectErrorHandler {
    private gameEngine: GameEngine;
    private errorHandler: ErrorHandler;
    private fallbackMode: boolean;
    private errorCount: number;
    private maxErrors: number;
    private errorHistory: ErrorInfo[];
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.fallbackMode = false;
        this.errorCount = 0;
        this.maxErrors = 10; // 最大エラー数
        this.errorHistory = [];
        

    }
    }
        this.initialize(); }
    }

    private initialize(): void { // グローバルエラーハンドリング
        this.setupGlobalErrorHandling();
        
        // Canvas コンテキストロスハンドリング
        this.setupCanvasErrorHandling();
        
        // パフォーマンスエラーハンドリング
        this.setupPerformanceErrorHandling(); }
    }
'';
    private setupGlobalErrorHandling()';
        window.addEventListener('error', (event) => {  ''
            if (this.isEffectRelatedError(event.error)') {' }'
                this.handleEffectError(event.error, 'global'); }'
            }''
        }');
';
        // Promise リジェクションのハンドリング
        window.addEventListener('unhandledrejection', (event) => {  ''
            if (this.isEffectRelatedError(event.reason)') {''
                this.handleEffectError(event.reason, 'promise'); }
                event.preventDefault(); }
            }
        });
    }
';'
    private setupCanvasErrorHandling(): void { const canvas = this.gameEngine.canvas;''
        if (!canvas') return;
';
        // Context lost イベント
        canvas.addEventListener('webglcontextlost', (event') => { ''
            console.warn('Canvas context lost');
            event.preventDefault(); }'
            this.handleContextLoss();' }'
        }');
';
        // Context restored イベント
        canvas.addEventListener('webglcontextrestored', (') => {  ''
            console.log('Canvas context restored'); }
            this.handleContextRestore(); }
        });
    }

    private setupPerformanceErrorHandling(): void { // パフォーマンス監視と自動フォールバック
        setInterval(() => {  }
            this.checkPerformanceHealth(); }
        }, 5000); // 5秒毎
    }

    private isEffectRelatedError(error: any): boolean { if (!error) return false;
        '';
        const errorMessage = error.message || error.toString(''';
            'particle', 'effect', 'rendering', 'canvas', 'context','';
            'WebGL', 'animation', 'shader', 'texture';
        ];)
        );
        return effectKeywords.some(keyword => );
            errorMessage.toLowerCase().includes(keyword.toLowerCase();
        ); }
    }

    private handleEffectError(error: Error, source: string): void { this.errorCount++;
        
        const errorInfo: ErrorInfo = {
            error: error,
            source: source,
            timestamp: Date.now();
            context: this.getErrorContext() }
        };
        
        this.errorHistory.push(errorInfo);
        
        // エラー履歴のサイズ制限
        if (this.errorHistory.length > 50) { this.errorHistory.shift(); }
        }
        
        console.error(`Effect error (${ source):`, error);
        
        // エラー数が閾値を超えた場合、フォールバックモードに移行
        if (this.errorCount >= this.maxErrors) { }
            this.enableFallbackMode(});
        } else { this.attemptRecovery(errorInfo); }
        }
        
        // エラーレポート
        this.reportError(errorInfo);
    }

    private getErrorContext(): ErrorContextInfo { return { fallbackMode: this.fallbackMode,
            fps: this.gameEngine.performanceOptimizer? .getCurrentFPS() || 0, : undefined;
            particleCount: this.gameEngine.enhancedParticleManager? .getActiveParticleCount() || 0, : undefined;
            effectCount: this.gameEngine.enhancedEffectManager? .getActiveEffectCount() || 0, : undefined;
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,' };'
            qualityLevel: this.gameEngine.effectQualityController? .getCurrentQualityLevel(') || 'unknown' }
        },
    }'
 : undefined'';
    private attemptRecovery(errorInfo: ErrorInfo'): void { ''
        console.log('Attempting error recovery...');
        
        try {
            // エラーの種類に応じて回復戦略を選択
            if(this.isMemoryError(errorInfo.error) {
                
            }
                this.recoverFromMemoryError(); }
            } else if(this.isRenderingError(errorInfo.error) { this.recoverFromRenderingError(); }
            } else if(this.isParticleError(errorInfo.error) { this.recoverFromParticleError(); }
            } else {  ''
                this.genericRecovery() }'
            console.log('Error recovery completed');' }'
        } catch (recoveryError) { ''
            console.error('Recovery failed:', recoveryError);
            this.enableFallbackMode(); }
        }
    }
';'
    private isMemoryError(error: Error): boolean { ''
        const message = error.message || error.toString()';
        return message.includes('memory'') || message.includes('heap'); }
    }
';'
    private isRenderingError(error: Error): boolean { ''
        const message = error.message || error.toString()';
        return message.includes('render'') || message.includes('canvas'') || '';
               message.includes('context'') || message.includes('WebGL'); }
    }
';'
    private isParticleError(error: Error): boolean { ''
        const message = error.message || error.toString()';
        return message.includes('particle'') || message.includes('effect'); }
    }

    private recoverFromMemoryError(): void { // メモリクリーンアップ
        if(this.gameEngine.enhancedParticleManager) {
            
        }
            this.gameEngine.enhancedParticleManager.forceCleanup(); }
        }
        
        if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.clearCache(); }
        }
        
        // ガベージコレクション要求
        if ((window as any).gc) { (window as any).gc(); }
        }
        
        // 品質レベルを下げる
        if(this.gameEngine.effectQualityController) {
            '';
            const currentQuality = this.gameEngine.effectQualityController.getCurrentQualityLevel()';
            const qualityLevels = ['low', 'medium', 'high', 'ultra'];)
            const currentIndex = qualityLevels.indexOf(currentQuality);
            
            if (currentIndex > 0) {
        }
                this.gameEngine.effectQualityController.setQualityLevel(qualityLevels[currentIndex - 1]); }
            }
        }
    }

    private recoverFromRenderingError(): void { // レンダリングコンテキストの再初期化試行
        try {
            const canvas = this.gameEngine.canvas;
            if(canvas') {'
                '';
                const context = canvas.getContext('2d');
                
                if (context) {
                    // コンテキストのリセット
                    context.save();
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    context.clearRect(0, 0, canvas.width, canvas.height);
            }
                    context.restore(); }
                }''
            } catch (contextError) { ''
            console.error('Context recovery failed:', contextError) }
        }
        
        // エフェクト設定をリセット
        if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.resetRenderingState(); }
        }
    }

    private recoverFromParticleError(): void { // パーティクルシステムのリセット
        if(this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.clearAllParticles();
        }
            this.gameEngine.enhancedParticleManager.resetSystem(); }
        }
        
        // パーティクル数制限を厳しくする
        if(this.gameEngine.effectPerformanceOptimizer) {
            this.gameEngine.effectPerformanceOptimizer.updateSettings({)
        }
                maxParticlesPerFrame: 100); }
        }
    }
'';
    private genericRecovery()';
        console.log('Applying generic recovery measures');
        
        // 全エフェクトをクリア
        this.clearAllEffects();
        ;
        // 最低品質に設定
        if(this.gameEngine.effectQualityController') {'
            ';'
        }'
            this.gameEngine.effectQualityController.setQualityLevel('low'); }
        }
        
        // パフォーマンス最適化を強制実行
        if (this.gameEngine.effectPerformanceOptimizer) { this.gameEngine.effectPerformanceOptimizer.manualOptimization(); }
        }
    }
';'
    private enableFallbackMode(): void { ''
        if (this.fallbackMode') return;'
        '';
        console.warn('Enabling effect fallback mode due to repeated errors');
        this.fallbackMode = true;
        
        // 全エフェクトを無効化
        this.disableAllEffects();
        
        // 基本的な機能のみ維持
        this.enableBasicFallback();
        
        // ユーザーへの通知
        this.notifyFallbackMode(); }
    }

    private disableAllEffects(): void { try {
            if(this.gameEngine.enhancedParticleManager) {
                
            }
                this.gameEngine.enhancedParticleManager.setEnabled(false); }
            }
            
            if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.setEnabled(false); }
            }
            
            if (this.gameEngine.seasonalEffectManager) { this.gameEngine.seasonalEffectManager.setEnabled(false); }
            }
            ';'
            if (this.gameEngine.animationManager) { this.gameEngine.animationManager.setEnabled(false);' }'
            } catch (disableError) { ''
            console.error('Error disabling effects:', disableError) }
        }
    }

    private enableBasicFallback(): void { // 最小限のエフェクトのみ有効化
        try {
            if(this.gameEngine.particleManager) {
                this.gameEngine.particleManager.setEnabled(true);
            }
                this.gameEngine.particleManager.setMaxParticles(50); // 最小限のパーティクル }
            }
            
            if(this.gameEngine.effectManager) {
            
                this.gameEngine.effectManager.setEnabled(true);
            
            }
                this.gameEngine.effectManager.setSimpleMode(true);' }'
            } catch (fallbackError) { ''
            console.error('Error enabling fallback mode:', fallbackError) }
        }
    }
';
    private notifyFallbackMode(): void { // デバッグインターフェースが利用可能な場合、警告を表示
        if(this.gameEngine.effectDebugInterface') {
            try {
                this.gameEngine.effectDebugInterface.showWarning(');
        }'
                    'エフェクトシステムがフォールバックモードで動作しています。');' }'
            } catch (notifyError) { ''
                console.error('Error showing fallback notification:', notifyError) }
            }
        }
    }'
'';
    private handleContextLoss()';
        console.warn('Handling canvas context loss');
        
        // エフェクトを一時停止
        this.pauseAllEffects();
        
        // リソースを解放
        this.releaseResources();
    }
'';
    private handleContextRestore()';
        console.log('Handling canvas context restore');
        
        // エフェクトシステムを再初期化
        this.reinitializeEffects();
        
        // エフェクトを再開
        this.resumeAllEffects();
    }

    private pauseAllEffects(): void { try {
            if(this.gameEngine.enhancedParticleManager) {
                
            }
                this.gameEngine.enhancedParticleManager.pause(); }
            }
            ';'
            if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.pause();' }'
            } catch (pauseError) { ''
            console.error('Error pausing effects:', pauseError) }
        }
    }

    private resumeAllEffects(): void { try {
            if(this.gameEngine.enhancedParticleManager) {
                
            }
                this.gameEngine.enhancedParticleManager.resume(); }
            }
            ';'
            if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.resume();' }'
            } catch (resumeError) { ''
            console.error('Error resuming effects:', resumeError) }
        }
    }

    private releaseResources(): void { // リソースの解放
        this.clearAllEffects(); }
    }

    private reinitializeEffects(): void { // エフェクトシステムの再初期化
        try {
            if(this.gameEngine.enhancedParticleManager) {
                
            }
                this.gameEngine.enhancedParticleManager.reinitialize(); }
            }
            ';'
            if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.reinitialize();' }'
            } catch (reinitError) { ''
            console.error('Error reinitializing effects:', reinitError) }
        }
    }

    private clearAllEffects(): void { try {
            if(this.gameEngine.enhancedParticleManager) {
                
            }
                this.gameEngine.enhancedParticleManager.clearAllParticles(); }
            }
            
            if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.clearAllEffects(); }
            }
            ';'
            if (this.gameEngine.animationManager) { this.gameEngine.animationManager.clearAllAnimations();' }'
            } catch (clearError) { ''
            console.error('Error clearing effects:', clearError) }
        }
    }

    private checkPerformanceHealth(): void { const fps = this.gameEngine.performanceOptimizer? .getCurrentFPS() || 60; : undefined
        const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
        ';
        // 危険なパフォーマンス状態の検出
        if(fps < 10 || memoryUsage > 1000') {'
            '';
            console.warn('Critical performance detected, applying emergency measures');
        }
            this.handleCriticalPerformance(); }
        }
    }

    private handleCriticalPerformance(): void { // 緊急パフォーマンス対策
        this.clearAllEffects();
        '';
        if(this.gameEngine.effectQualityController') {'
            ';'
        }'
            this.gameEngine.effectQualityController.setQualityLevel('low'); }
        }
        
        if (this.gameEngine.effectPerformanceOptimizer) { this.gameEngine.effectPerformanceOptimizer.emergencyOptimization(); }
        }
    }'
'';
    private reportError(errorInfo: ErrorInfo'): void { // エラーの統計とレポート
        this.errorHandler.logError(errorInfo.error, {')'
            component: 'EffectSystem',);
            source: errorInfo.source),
            context: JSON.stringify(errorInfo.context) }
        });
    }

    // API メソッド
    public getErrorStats(): ErrorStats { return { totalErrors: this.errorCount,
            fallbackMode: this.fallbackMode,
            recentErrors: this.errorHistory.slice(-10) };
            healthStatus: this.getHealthStatus(); }
        };
    }
';'
    private getHealthStatus(): HealthStatus { ''
        if (this.fallbackMode') return 'fallback';''
        if (this.errorCount > this.maxErrors * 0.7') return 'warning';''
        if (this.errorCount > 0') return 'caution';''
        return 'healthy'; }
    }'
'';
    public resetErrorCount()';
        console.log('Error count reset');
    }
';'
    public exitFallbackMode(): void { ''
        if (!this.fallbackMode') return;'
        '';
        console.log('Attempting to exit fallback mode...');
        this.fallbackMode = false;
        this.resetErrorCount();
        
        // エフェクトシステムを再有効化
        try {'
            this.enableBasicEffects()';
            console.log('Successfully exited fallback mode');' }'
        } catch (exitError) { ''
            console.error('Failed to exit fallback mode:', exitError);
            this.fallbackMode = true; }
        }
    }

    private enableBasicEffects(): void { if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setEnabled(true); }
        }
        
        if(this.gameEngine.enhancedEffectManager) {
        ';'
            ';'
        }'
            this.gameEngine.enhancedEffectManager.setEnabled(true'); }
        }
    }
}

// グローバルアクセス用
declare global { interface Window {
        EffectErrorHandler: typeof EffectErrorHandler }
    }
}
'';
window.EffectErrorHandler = EffectErrorHandler;