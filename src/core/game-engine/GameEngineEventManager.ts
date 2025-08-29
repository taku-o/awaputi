/**
 * Game Engine Event Manager
 * イベント管理・入力処理・統合機能を担当
 */
// import { getPerformanceOptimizer } from '../../utils/PerformanceOptimizer.js';

interface GameEngine {
    eventListeners: Map<string, Function[]>;
    // 他のプロパティは必要に応じて追加
}

export class GameEngineEventManager {
    private gameEngine: GameEngine;
    
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * イベントリスナーを追加
     * @param eventName - イベント名
     * @param listener - リスナー関数
     */
    on(eventName: string, listener: Function): void {
        if (!this.gameEngine.eventListeners.has(eventName)) {
            this.gameEngine.eventListeners.set(eventName, []);
        }
        this.gameEngine.eventListeners.get(eventName)!.push(listener);
    }
    
    /**
     * イベントを発火
     * @param eventName - イベント名
     * @param data - イベントデータ
     */
    emit(eventName: string, data?: any): void {
        const listeners = this.gameEngine.eventListeners.get(eventName);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`[GameEngine] Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }
    
    /**
     * イベントリスナーを削除
     * @param eventName - イベント名
     * @param listener - リスナー関数
     */
    off(eventName: string, listener: Function): void {
        const listeners = this.gameEngine.eventListeners.get(eventName);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * 更新処理
     * @param deltaTime - 前フレームからの経過時間
     */
    update(_deltaTime: number): void {
        // イベントシステムの更新処理
        // 現時点では特に処理なし（将来的に実装）
    }
    
    /**
     * リソースの破棄
     */
    destroy(): void {
        // イベントリスナーのクリア
        this.gameEngine.eventListeners.clear();
        console.log('[GameEngineEventManager] Destroyed');
    }
}

export default GameEngineEventManager;