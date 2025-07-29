/**
 * Effect Error Handler
 * エフェクトシステム専用のエラーハンドリングとフォールバック機能
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class EffectErrorHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.fallbackMode = false;
        this.errorCount = 0;
        this.maxErrors = 10; // 最大エラー数
        this.errorHistory = [];
        
        this.initialize();
    }

    initialize() {
        // グローバルエラーハンドリング
        this.setupGlobalErrorHandling();
        
        // Canvas コンテキストロスハンドリング
        this.setupCanvasErrorHandling();
        
        // パフォーマンスエラーハンドリング
        this.setupPerformanceErrorHandling();
    }

    setupGlobalErrorHandling() {
        // エフェクト関連のエラーをキャッチ
        window.addEventListener('error', (event) => {
            if (this.isEffectRelatedError(event.error)) {
                this.handleEffectError(event.error, 'global');
            }
        });

        // Promise リジェクションのハンドリング
        window.addEventListener('unhandledrejection', (event) => {
            if (this.isEffectRelatedError(event.reason)) {
                this.handleEffectError(event.reason, 'promise');
                event.preventDefault();
            }
        });
    }

    setupCanvasErrorHandling() {
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;

        // Context lost イベント
        canvas.addEventListener('webglcontextlost', (event) => {
            console.warn('Canvas context lost');
            event.preventDefault();
            this.handleContextLoss();
        });

        // Context restored イベント
        canvas.addEventListener('webglcontextrestored', () => {
            console.log('Canvas context restored');
            this.handleContextRestore();
        });
    }

    setupPerformanceErrorHandling() {
        // パフォーマンス監視と自動フォールバック
        setInterval(() => {
            this.checkPerformanceHealth();
        }, 5000); // 5秒毎
    }

    isEffectRelatedError(error) {
        if (!error) return false;
        
        const errorMessage = error.message || error.toString();
        const effectKeywords = [
            'particle', 'effect', 'rendering', 'canvas', 'context',
            'WebGL', 'animation', 'shader', 'texture'
        ];
        
        return effectKeywords.some(keyword => 
            errorMessage.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    handleEffectError(error, source) {
        this.errorCount++;
        
        const errorInfo = {
            error: error,
            source: source,
            timestamp: Date.now(),
            context: this.getErrorContext()
        };
        
        this.errorHistory.push(errorInfo);
        
        // エラー履歴のサイズ制限
        if (this.errorHistory.length > 50) {
            this.errorHistory.shift();
        }
        
        console.error(`Effect error (${source}):`, error);
        
        // エラー数が閾値を超えた場合、フォールバックモードに移行
        if (this.errorCount >= this.maxErrors) {
            this.enableFallbackMode();
        } else {
            this.attemptRecovery(errorInfo);
        }
        
        // エラーレポート
        this.reportError(errorInfo);
    }

    getErrorContext() {
        return {
            fallbackMode: this.fallbackMode,
            fps: this.gameEngine.performanceOptimizer?.getCurrentFPS() || 0,
            particleCount: this.gameEngine.enhancedParticleManager?.getActiveParticleCount() || 0,
            effectCount: this.gameEngine.enhancedEffectManager?.getActiveEffectCount() || 0,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
            qualityLevel: this.gameEngine.effectQualityController?.getCurrentQualityLevel() || 'unknown'
        };
    }

    attemptRecovery(errorInfo) {
        console.log('Attempting error recovery...');
        
        try {
            // エラーの種類に応じて回復戦略を選択
            if (this.isMemoryError(errorInfo.error)) {
                this.recoverFromMemoryError();
            } else if (this.isRenderingError(errorInfo.error)) {
                this.recoverFromRenderingError();
            } else if (this.isParticleError(errorInfo.error)) {
                this.recoverFromParticleError();
            } else {
                this.genericRecovery();
            }
            
            console.log('Error recovery completed');
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
            this.enableFallbackMode();
        }
    }

    isMemoryError(error) {
        const message = error.message || error.toString();
        return message.includes('memory') || message.includes('heap');
    }

    isRenderingError(error) {
        const message = error.message || error.toString();
        return message.includes('render') || message.includes('canvas') || 
               message.includes('context') || message.includes('WebGL');
    }

    isParticleError(error) {
        const message = error.message || error.toString();
        return message.includes('particle') || message.includes('effect');
    }

    recoverFromMemoryError() {
        // メモリクリーンアップ
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.forceCleanup();
        }
        
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.clearCache();
        }
        
        // ガベージコレクション要求
        if (window.gc) {
            window.gc();
        }
        
        // 品質レベルを下げる
        if (this.gameEngine.effectQualityController) {
            const currentQuality = this.gameEngine.effectQualityController.getCurrentQualityLevel();
            const qualityLevels = ['low', 'medium', 'high', 'ultra'];
            const currentIndex = qualityLevels.indexOf(currentQuality);
            
            if (currentIndex > 0) {
                this.gameEngine.effectQualityController.setQualityLevel(qualityLevels[currentIndex - 1]);
            }
        }
    }

    recoverFromRenderingError() {
        // レンダリングコンテキストの再初期化試行
        try {
            const canvas = this.gameEngine.canvas;
            const context = canvas.getContext('2d');
            
            if (context) {
                // コンテキストのリセット
                context.save();
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.restore();
            }
        } catch (contextError) {
            console.error('Context recovery failed:', contextError);
        }
        
        // エフェクト設定をリセット
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.resetRenderingState();
        }
    }

    recoverFromParticleError() {
        // パーティクルシステムのリセット
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.clearAllParticles();
            this.gameEngine.enhancedParticleManager.resetSystem();
        }
        
        // パーティクル数制限を厳しくする
        if (this.gameEngine.effectPerformanceOptimizer) {
            this.gameEngine.effectPerformanceOptimizer.updateSettings({
                maxParticlesPerFrame: 100
            });
        }
    }

    genericRecovery() {
        // 汎用回復処理
        console.log('Applying generic recovery measures');
        
        // 全エフェクトをクリア
        this.clearAllEffects();
        
        // 最低品質に設定
        if (this.gameEngine.effectQualityController) {
            this.gameEngine.effectQualityController.setQualityLevel('low');
        }
        
        // パフォーマンス最適化を強制実行
        if (this.gameEngine.effectPerformanceOptimizer) {
            this.gameEngine.effectPerformanceOptimizer.manualOptimization();
        }
    }

    enableFallbackMode() {
        if (this.fallbackMode) return;
        
        console.warn('Enabling effect fallback mode due to repeated errors');
        this.fallbackMode = true;
        
        // 全エフェクトを無効化
        this.disableAllEffects();
        
        // 基本的な機能のみ維持
        this.enableBasicFallback();
        
        // ユーザーへの通知
        this.notifyFallbackMode();
    }

    disableAllEffects() {
        try {
            if (this.gameEngine.enhancedParticleManager) {
                this.gameEngine.enhancedParticleManager.setEnabled(false);
            }
            
            if (this.gameEngine.enhancedEffectManager) {
                this.gameEngine.enhancedEffectManager.setEnabled(false);
            }
            
            if (this.gameEngine.seasonalEffectManager) {
                this.gameEngine.seasonalEffectManager.setEnabled(false);
            }
            
            if (this.gameEngine.animationManager) {
                this.gameEngine.animationManager.setEnabled(false);
            }
        } catch (disableError) {
            console.error('Error disabling effects:', disableError);
        }
    }

    enableBasicFallback() {
        // 最小限のエフェクトのみ有効化
        try {
            if (this.gameEngine.particleManager) {
                this.gameEngine.particleManager.setEnabled(true);
                this.gameEngine.particleManager.setMaxParticles(50); // 最小限のパーティクル
            }
            
            if (this.gameEngine.effectManager) {
                this.gameEngine.effectManager.setEnabled(true);
                this.gameEngine.effectManager.setSimpleMode(true);
            }
        } catch (fallbackError) {
            console.error('Error enabling fallback mode:', fallbackError);
        }
    }

    notifyFallbackMode() {
        // デバッグインターフェースが利用可能な場合、警告を表示
        if (this.gameEngine.effectDebugInterface) {
            try {
                this.gameEngine.effectDebugInterface.showWarning(
                    'エフェクトシステムがフォールバックモードで動作しています。'
                );
            } catch (notifyError) {
                console.error('Error showing fallback notification:', notifyError);
            }
        }
    }

    handleContextLoss() {
        console.warn('Handling canvas context loss');
        
        // エフェクトを一時停止
        this.pauseAllEffects();
        
        // リソースを解放
        this.releaseResources();
    }

    handleContextRestore() {
        console.log('Handling canvas context restore');
        
        // エフェクトシステムを再初期化
        this.reinitializeEffects();
        
        // エフェクトを再開
        this.resumeAllEffects();
    }

    pauseAllEffects() {
        try {
            if (this.gameEngine.enhancedParticleManager) {
                this.gameEngine.enhancedParticleManager.pause();
            }
            
            if (this.gameEngine.enhancedEffectManager) {
                this.gameEngine.enhancedEffectManager.pause();
            }
        } catch (pauseError) {
            console.error('Error pausing effects:', pauseError);
        }
    }

    resumeAllEffects() {
        try {
            if (this.gameEngine.enhancedParticleManager) {
                this.gameEngine.enhancedParticleManager.resume();
            }
            
            if (this.gameEngine.enhancedEffectManager) {
                this.gameEngine.enhancedEffectManager.resume();
            }
        } catch (resumeError) {
            console.error('Error resuming effects:', resumeError);
        }
    }

    releaseResources() {
        // リソースの解放
        this.clearAllEffects();
    }

    reinitializeEffects() {
        // エフェクトシステムの再初期化
        try {
            if (this.gameEngine.enhancedParticleManager) {
                this.gameEngine.enhancedParticleManager.reinitialize();
            }
            
            if (this.gameEngine.enhancedEffectManager) {
                this.gameEngine.enhancedEffectManager.reinitialize();
            }
        } catch (reinitError) {
            console.error('Error reinitializing effects:', reinitError);
        }
    }

    clearAllEffects() {
        try {
            if (this.gameEngine.enhancedParticleManager) {
                this.gameEngine.enhancedParticleManager.clearAllParticles();
            }
            
            if (this.gameEngine.enhancedEffectManager) {
                this.gameEngine.enhancedEffectManager.clearAllEffects();
            }
            
            if (this.gameEngine.animationManager) {
                this.gameEngine.animationManager.clearAllAnimations();
            }
        } catch (clearError) {
            console.error('Error clearing effects:', clearError);
        }
    }

    checkPerformanceHealth() {
        const fps = this.gameEngine.performanceOptimizer?.getCurrentFPS() || 60;
        const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
        
        // 危険なパフォーマンス状態の検出
        if (fps < 10 || memoryUsage > 1000) {
            console.warn('Critical performance detected, applying emergency measures');
            this.handleCriticalPerformance();
        }
    }

    handleCriticalPerformance() {
        // 緊急パフォーマンス対策
        this.clearAllEffects();
        
        if (this.gameEngine.effectQualityController) {
            this.gameEngine.effectQualityController.setQualityLevel('low');
        }
        
        if (this.gameEngine.effectPerformanceOptimizer) {
            this.gameEngine.effectPerformanceOptimizer.emergencyOptimization();
        }
    }

    reportError(errorInfo) {
        // エラーの統計とレポート
        this.errorHandler.logError(errorInfo.error, {
            component: 'EffectSystem',
            source: errorInfo.source,
            context: errorInfo.context
        });
    }

    // API メソッド
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            fallbackMode: this.fallbackMode,
            recentErrors: this.errorHistory.slice(-10),
            healthStatus: this.getHealthStatus()
        };
    }

    getHealthStatus() {
        if (this.fallbackMode) return 'fallback';
        if (this.errorCount > this.maxErrors * 0.7) return 'warning';
        if (this.errorCount > 0) return 'caution';
        return 'healthy';
    }

    resetErrorCount() {
        this.errorCount = 0;
        this.errorHistory = [];
        console.log('Error count reset');
    }

    exitFallbackMode() {
        if (!this.fallbackMode) return;
        
        console.log('Attempting to exit fallback mode...');
        this.fallbackMode = false;
        this.resetErrorCount();
        
        // エフェクトシステムを再有効化
        try {
            this.enableBasicEffects();
            console.log('Successfully exited fallback mode');
        } catch (exitError) {
            console.error('Failed to exit fallback mode:', exitError);
            this.fallbackMode = true;
        }
    }

    enableBasicEffects() {
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setEnabled(true);
        }
        
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.setEnabled(true);
        }
    }
}

// グローバルアクセス用
window.EffectErrorHandler = EffectErrorHandler;