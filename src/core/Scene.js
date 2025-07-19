/**
 * シーン基底クラス
 */
export class Scene {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.sceneManager = null;
    }
    
    /**
     * シーンマネージャーを設定
     */
    setSceneManager(sceneManager) {
        this.sceneManager = sceneManager;
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        // オーバーライド用
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        // オーバーライド用
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // オーバーライド用
    }
    
    /**
     * 描画処理
     */
    render(context) {
        // オーバーライド用
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        // オーバーライド用
    }
}