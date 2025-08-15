/**
 * シーン管理クラス
 */
import { Scene } from '../types/game';

// Extended Scene interface for SceneManager integration
interface ExtendedScene extends Omit<Scene, 'enter'> {
    setSceneManager(sceneManager: SceneManager): void;
    enter(contextData?: SceneContextData): void;
}

interface SceneContextData {
    [key: string]: any;
}

export class SceneManager {
    private __gameEngine: any; // GameEngine type would be defined elsewhere - prefixed with __ as unused
    private scenes: Map<string, ExtendedScene>;
    private currentScene: ExtendedScene | null;
    private __nextScene: ExtendedScene | null; // prefixed with __ as unused
    private lastUpdateDebugTime?: number;
    private lastSceneWarnTime?: number;
    
    constructor(gameEngine: any) {
        this.__gameEngine = gameEngine;
        this.scenes = new Map<string, ExtendedScene>();
        this.currentScene = null;
        this.__nextScene = null;
    }
    
    /**
     * シーンを追加
     */
    addScene(name: string, scene: ExtendedScene): void {
        this.scenes.set(name, scene);
        scene.setSceneManager(this);
    }
    
    /**
     * シーンを切り替え
     * @param name - 切り替え先シーン名
     * @param contextData - シーンに渡すコンテキストデータ（オプション）
     * @returns 切り替えが成功したかどうか
     */
    switchScene(name: string, contextData: SceneContextData | null = null): boolean {
        const scene = this.scenes.get(name);
        if (!scene) {
            console.error(`Scene ${name} not found`);
            return false;
        }
        
        // 現在のシーンを終了
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // 新しいシーンを開始（コンテキストデータを渡す）
        this.currentScene = scene;
        this.currentScene.enter(contextData || {});
        
        console.log(`Switched to scene: ${name}`);
        return true;
    }
    
    /**
     * 現在のシーンを取得
     */
    getCurrentScene(): ExtendedScene | null {
        return this.currentScene;
    }
    
    /**
     * 指定された名前のシーンを取得
     * @param name - シーン名
     * @returns シーンオブジェクト、存在しない場合はnull
     */
    getScene(name: string): ExtendedScene | null {
        return this.scenes.get(name) || null;
    }
    
    /**
     * 指定された名前のシーンが存在するかチェック
     * @param name - シーン名
     * @returns シーンが存在するかどうか
     */
    hasScene(name: string): boolean {
        return this.scenes.has(name);
    }
    
    /**
     * 更新処理
     */
    update(deltaTime: number): void {
        // Debug logs throttled to prevent console flooding - only log occasionally
        if (!this.lastUpdateDebugTime || performance.now() - this.lastUpdateDebugTime > 5000) {
            console.log(`[DEBUG] SceneManager.update working - scene: ${this.currentScene?.constructor?.name || 'null'}`);
            this.lastUpdateDebugTime = performance.now();
        }
        
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        } else {
            // Only warn occasionally about missing scene
            if (!this.lastSceneWarnTime || performance.now() - this.lastSceneWarnTime > 10000) {
                console.warn(`[DEBUG] No current scene to update`);
                this.lastSceneWarnTime = performance.now();
            }
        }
    }
    
    /**
     * 描画処理
     */
    render(context: CanvasRenderingContext2D): void {
        if (this.currentScene) {
            this.currentScene.render(context);
        }
    }
    
    /**
     * 入力処理
     */
    handleInput(event: Event): void {
        if (this.currentScene) {
            // Event -> InputEvent conversion for backward compatibility
            this.currentScene.handleInput(event as any);
        }
    }
    
    /**
     * 全シーンの一覧を取得（デバッグ用）
     */
    getAllScenes(): string[] {
        return Array.from(this.scenes.keys());
    }
    
    /**
     * シーンを削除
     */
    removeScene(name: string): boolean {
        if (this.currentScene === this.scenes.get(name)) {
            console.warn(`Cannot remove current scene: ${name}`);
            return false;
        }
        
        return this.scenes.delete(name);
    }
    
    /**
     * シーンマネージャーを開始（必要に応じてゲームエンジンから呼び出される）
     */
    start(): void {
        console.log('[SceneManager] Started');
    }
    
    /**
     * シーンマネージャーを停止（必要に応じてゲームエンジンから呼び出される）
     */
    stop(): void {
        if (this.currentScene) {
            this.currentScene.exit();
            this.currentScene = null;
        }
        console.log('[SceneManager] Stopped');
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy(): void {
        this.stop();
        this.scenes.clear();
        this.__nextScene = null;
        console.log('[SceneManager] Destroyed');
    }
}

