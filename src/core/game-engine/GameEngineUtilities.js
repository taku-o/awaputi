/**
 * Game Engine Utilities
 * ユーティリティ・レスポンシブ・クリーンアップ機能を担当
 */
export class GameEngineUtilities {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * デバッグモードかどうか
     */
    isDebugMode() {
        return localStorage.getItem('debug') === 'true';
    }
    
    /**
     * パフォーマンス統計を更新
     */
    updatePerformanceStats() {
        const perfStats = this.gameEngine.performanceMonitor.getStats();
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        const optimizerStats = getPerformanceOptimizer().getStats();
        
        this.gameEngine.performanceStats = {
            fps: perfStats.fps,
            renderTime: this.gameEngine.performanceStats.renderTime,
            updateTime: this.gameEngine.performanceStats.updateTime,
            memoryUsage: perfStats.memoryUsage.usedJSHeapSize || 0,
            performanceLevel: optimizerStats.performanceLevel
        };
    }
    
    /**
     * Canvas リサイズ時のコールバック
     */
    onCanvasResize(canvasInfo) {
        console.log('Canvas resized:', canvasInfo);
        
        // レンダリング最適化システムを更新
        this.gameEngine.renderOptimizer.setViewport(0, 0, canvasInfo.actualWidth, canvasInfo.actualHeight);
        
        // パフォーマンス最適化システムに通知
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        getPerformanceOptimizer().onCanvasResize(canvasInfo);
        
        // シーンマネージャーに通知
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.onCanvasResize?.(canvasInfo);
        }
        
        // UI要素の位置を調整
        this.adjustUIForCanvasSize(canvasInfo);
    }
    
    /**
     * Canvas サイズに応じてUIを調整
     */
    adjustUIForCanvasSize(canvasInfo) {
        // UI要素のスケールを調整
        const uiScale = Math.min(canvasInfo.scale, 1.5); // 最大1.5倍まで
        
        // フォントサイズを調整
        const baseFontSize = 18;
        const adjustedFontSize = Math.max(12, baseFontSize * uiScale);
        
        // UI要素のサイズ情報を保存
        this.gameEngine.uiInfo = {
            scale: uiScale,
            fontSize: adjustedFontSize,
            canvasInfo: canvasInfo
        };
        
        // HTML UI要素も調整
        this.adjustHTMLUI(canvasInfo);
    }
    
    /**
     * HTML UI要素を調整
     */
    adjustHTMLUI(canvasInfo) {
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            // UI要素のスケールを調整
            const scale = Math.min(canvasInfo.scale, 1.2);
            gameUI.style.transform = `scale(${scale})`;
            gameUI.style.transformOrigin = 'top left';
            
            // モバイルデバイスでの調整
            const { getBrowserCompatibility } = require('../utils/BrowserCompatibility.js');
            const browserCompatibility = getBrowserCompatibility();
            if (browserCompatibility.deviceInfo.isMobile) {
                gameUI.style.fontSize = `${14 * scale}px`;
                
                // 縦向きの場合は位置を調整
                const orientation = browserCompatibility.getOrientation();
                if (orientation.includes('portrait')) {
                    gameUI.style.top = '5px';
                    gameUI.style.left = '5px';
                } else {
                    gameUI.style.top = '10px';
                    gameUI.style.left = '10px';
                }
            }
        }
    }
    
    /**
     * デバイス固有の最適化を取得
     */
    getDeviceOptimizations() {
        const { getBrowserCompatibility } = require('../utils/BrowserCompatibility.js');
        const browserCompatibility = getBrowserCompatibility();
        const deviceInfo = browserCompatibility.deviceInfo;
        const browserInfo = browserCompatibility.browserInfo;
        
        return {
            // タッチデバイス用の調整
            touchOptimizations: deviceInfo.isTouchDevice ? {
                largerHitboxes: true,
                reducedParticles: deviceInfo.isMobile,
                simplifiedEffects: deviceInfo.isMobile
            } : null,
            
            // ブラウザ固有の調整
            browserOptimizations: {
                safari: browserInfo.name === 'safari' ? {
                    disableImageSmoothing: deviceInfo.isMobile,
                    reduceAnimationFrameRate: deviceInfo.isMobile
                } : null,
                
                firefox: browserInfo.name === 'firefox' ? {
                    enableHardwareAcceleration: true
                } : null,
                
                chrome: browserInfo.name === 'chrome' ? {
                    enableOffscreenCanvas: browserCompatibility.features.offscreenCanvas
                } : null
            },
            
            // パフォーマンス調整
            performanceOptimizations: {
                lowEndDevice: deviceInfo.screenInfo.pixelRatio < 1.5,
                highEndDevice: deviceInfo.screenInfo.pixelRatio > 2,
                limitParticles: deviceInfo.isMobile,
                reduceEffects: deviceInfo.isMobile && deviceInfo.screenInfo.width < 400
            }
        };
    }
    
    /**
     * レスポンシブCanvas情報を取得
     */
    getCanvasInfo() {
        return this.gameEngine.responsiveCanvasManager?.getCanvasInfo() || {
            displayWidth: this.gameEngine.canvas.width,
            displayHeight: this.gameEngine.canvas.height,
            actualWidth: this.gameEngine.canvas.width,
            actualHeight: this.gameEngine.canvas.height,
            scale: 1,
            pixelRatio: 1
        };
    }
    
    /**
     * フルスクリーンモードを切り替え
     */
    toggleFullscreen() {
        if (this.gameEngine.responsiveCanvasManager) {
            this.gameEngine.responsiveCanvasManager.toggleFullscreen();
        }
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        const { getMemoryManager } = require('../utils/MemoryManager.js');
        
        // すべてのプールをクリア
        getPoolManager().clearAll();
        
        // レンダリング最適化をクリーンアップ
        this.gameEngine.renderOptimizer.cleanup();
        
        // エフェクトマネージャーをクリア（既存）
        this.gameEngine.effectManager.clearAllEffects();
        
        // パーティクルマネージャーをクリア（既存）
        this.gameEngine.particleManager.clearAllParticles();
        
        // 拡張エフェクトシステムのクリーンアップ
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.dispose();
        }
        
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.dispose();
        }
        
        if (this.gameEngine.seasonalEffectManager) {
            this.gameEngine.seasonalEffectManager.dispose();
        }
        
        if (this.gameEngine.effectPerformanceMonitor) {
            this.gameEngine.effectPerformanceMonitor.dispose();
        }
        
        if (this.gameEngine.effectQualityController) {
            this.gameEngine.effectQualityController.dispose();
        }
        
        if (this.gameEngine.effectConfigurationIntegrator) {
            this.gameEngine.effectConfigurationIntegrator.dispose();
        }
        
        if (this.gameEngine.audioVisualSynchronizer) {
            this.gameEngine.audioVisualSynchronizer.dispose();
        }
        
        // チャレンジシステムのクリーンアップ
        if (this.gameEngine.challengeSystem) {
            this.gameEngine.challengeSystem.cleanup();
        }
        
        // デイリーチャレンジシステムのクリーンアップ
        if (this.gameEngine.dailyChallengeManager) {
            this.gameEngine.dailyChallengeManager.cleanup();
        }
        
        // ウィークリーチャレンジシステムのクリーンアップ
        if (this.gameEngine.weeklyChallengeManager) {
            this.gameEngine.weeklyChallengeManager.cleanup();
        }
        
        // リーダーボードシステムのクリーンアップ
        if (this.gameEngine.leaderboardManager) {
            this.gameEngine.leaderboardManager.cleanup();
        }
        
        // メモリ最適化を実行
        getMemoryManager().performCleanup();
        
        console.log('Game cleanup completed (with enhanced effects)');
    }
    
    /**
     * ゲームエンジンを破棄
     */
    destroy() {
        this.gameEngine.stop();
        this.cleanup();
        
        // レスポンシブCanvas管理をクリーンアップ
        if (this.gameEngine.responsiveCanvasManager) {
            this.gameEngine.responsiveCanvasManager.cleanup();
        }
        
        // イベントリスナーを削除
        const { getMemoryManager } = require('../utils/MemoryManager.js');
        getMemoryManager().removeAllEventListeners();
        
        // パフォーマンス最適化システムをリセット
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        getPerformanceOptimizer().reset();
        
        // 音響システムを停止
        this.gameEngine.audioManager.stopAll();
    }
}