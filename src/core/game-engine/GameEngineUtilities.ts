/**
 * Game Engine Utilities
 * ユーティリティ・レスポンシブ・クリーンアップ機能を担当
 */
import { getPerformanceOptimizer  } from '../../utils/PerformanceOptimizer.js';
// import { getMemoryManager  } from '../../utils/MemoryManager.js';

interface GameEngine {
    performanceMonitor?: any;
    performanceStats?: any;
    canvas?: HTMLCanvasElement;
    context?: CanvasRenderingContext2D;
    responsiveCanvasManager?: any;
    memoryManager?: any;
    audioManager?: any;
    errorHandler?: any;
    eventListeners?: Map<string, any[]>;
}

export class GameEngineUtilities {
    private gameEngine: GameEngine;
    
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * デバッグモードかどうか
     */
    isDebugMode(): boolean {
        return localStorage.getItem('debug') === 'true';
    }
    
    /**
     * パフォーマンス統計を更新
     */
    updatePerformanceStats(): void { if (!this.gameEngine.performanceMonitor?.getStats) {
            return }
        
        const perfStats = this.gameEngine.performanceMonitor.getStats();
        const optimizerStats = getPerformanceOptimizer().getStats();
        
        this.gameEngine.performanceStats = { : undefined
            fps: perfStats.fps || 0,
    renderTime: this.gameEngine.performanceStats?.renderTime || 0, : undefined
            updateTime: this.gameEngine.performanceStats?.updateTime || 0, : undefined','
            memoryUsage: perfStats.memoryUsage?.usedJSHeapSize || 0, : undefined','
            performanceLevel: (optimizerStats, as any').performanceLevel || 'medium'
            }
    
    /**
     * Canvas リサイズ時のコールバック'
     */''
    onCanvasResize()';'
        console.log('[GameEngineUtilities] Canvas resized:', { width: this.gameEngine.canvas?.width, : undefined)
            height: this.gameEngine.canvas?.height),
        // レスポンシブキャンバスマネージャーに通知
        if (this.gameEngine.responsiveCanvasManager?.handleResize) {
    
}
            this.gameEngine.responsiveCanvasManager.handleResize(); }
}
    
    /**
     * メモリクリーンアップ
     */ : undefined''
    performMemoryCleanup()';'
        console.log('[GameEngineUtilities] Performing, memory cleanup...);'
        
        // メモリマネージャーによるクリーンアップ
        if (this.gameEngine.memoryManager?.cleanup) { this.gameEngine.memoryManager.cleanup();
        
        // ガベージコレクションのヒント
        if ((window, as any).gc') { ''
            (window, as any).gc()','
        console.log('[GameEngineUtilities] Memory, cleanup completed') }'
    
    /**
     * エラーレポート
     * @param error - エラーオブジェクト
     * @param context - エラーコンテキスト
     */ : undefined
    reportError(error: Error, context: string): void { console.error(`[GameEngineUtilities] Error, in ${context):`, error};
        ';'
        // エラーハンドラーに通知
        if(this.gameEngine.errorHandler?.handleError} {'

            this.gameEngine.errorHandler.handleError(error, 'GAME_ENGINE_ERROR', { : undefined'
        }''
                component: 'GameEngineUtilities');
                context);
        }
    }
    
    /**
     * システム情報の取得
     */
    getSystemInfo(): object { return { userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
    screenResolution: {
                width: window.screen.width ,
                height: window.screen.height 
    };
            windowSize: { width: window.innerWidth,
    height: window.innerHeight ,
            devicePixelRatio: window.devicePixelRatio || 1,
            memory: (navigator, as any').deviceMemory || 'unknown','
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown' } }
    
    /**
     * ゲーム状態のスナップショット取得
     */
    getGameSnapshot(): object { return { timestamp: Date.now() ,
            systemInfo: this.getSystemInfo(),
            performanceStats: this.gameEngine.performanceStats || {},
            audioEnabled: this.gameEngine.audioManager?.isEnabled || false, : undefined
            debugMode: this.isDebugMode();
        }
    
    /**
     * リソースの破棄'
     */''
    destroy()';'
        console.log('[GameEngineUtilities] Destroyed');
    }
}

export default GameEngineUtilities;