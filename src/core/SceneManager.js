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
     * 更新処理
     */
    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
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

