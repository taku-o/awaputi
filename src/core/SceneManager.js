/**
 * シーン管理クラス
 */
export class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scenes = new Map();
        this.currentScene = null;
        this.nextScene = null;
    }
    
    /**
     * シーンを追加
     */
    addScene(name, scene) {
        this.scenes.set(name, scene);
        scene.setSceneManager(this);
    }
    
    /**
     * シーンを切り替え
     */
    switchScene(name) {
        const scene = this.scenes.get(name);
        if (!scene) {
            console.error(`Scene ${name} not found`);
            return false;
        }
        
        // 現在のシーンを終了
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // 新しいシーンを開始
        this.currentScene = scene;
        this.currentScene.enter();
        
        console.log(`Switched to scene: ${name}`);
        return true;
    }
    
    /**
     * 現在のシーンを取得
     */
    getCurrentScene() {
        return this.currentScene;
    }
    
    /**
     * 指定された名前のシーンを取得
     * @param {string} name - シーン名
     * @returns {Object|null} シーンオブジェクト、存在しない場合はnull
     */
    getScene(name) {
        return this.scenes.get(name) || null;
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
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
    render(context) {
        if (this.currentScene) {
            this.currentScene.render(context);
        }
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (this.currentScene) {
            this.currentScene.handleInput(event);
        }
    }
}

