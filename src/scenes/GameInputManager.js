/**
 * ゲーム専用入力管理クラス
 */
import { InputManager } from '../core/InputManager.js';

export class GameInputManager extends InputManager {
    constructor(canvas, gameScene) {
        super(canvas);
        this.gameScene = gameScene;
        this.gameEngine = gameScene.gameEngine;
    }
    
    /**
     * クリック処理
     */
    notifyClick(position) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 泡のクリック処理
        const bubbleClicked = this.gameEngine.bubbleManager.handleClick(position.x, position.y);
        
        // クリック位置にフィードバック
        if (bubbleClicked) {
            this.gameScene.createDragParticles(position.x, position.y, 20);
        }
    }
    
    /**
     * ポインター移動処理
     */
    notifyPointerMove(position) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) {
            return;
        }
        
        // マウス位置の更新
        this.gameEngine.bubbleManager.updateMousePosition(position.x, position.y);
    }
    
    /**
     * ドラッグ開始処理
     */
    notifyDragStart(startPosition) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // ドラッグ対象の泡を検索
        const targetBubble = this.gameEngine.bubbleManager.handleDragStart(startPosition.x, startPosition.y);
        
        // ビジュアルフィードバックを開始
        this.gameScene.startDragVisualization(startPosition, targetBubble);
    }
    
    /**
     * ドラッグ移動処理
     */
    notifyDragMove(currentPosition) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // ビジュアルフィードバックを更新
        this.gameScene.updateDragVisualizationPosition(currentPosition);
        
        // BubbleManagerのドラッグ移動も呼び出し
        this.gameEngine.bubbleManager.handleDragMove(currentPosition.x, currentPosition.y);
    }
    
    /**
     * ドラッグ終了処理
     */
    notifyDragEnd(startPosition, endPosition, dragVector) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 泡を吹き飛ばす処理
        const success = this.gameEngine.bubbleManager.handleDragEnd(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
        
        if (success) {
            // パーティクル効果を生成
            const force = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
            this.gameScene.createDragParticles(endPosition.x, endPosition.y, force / 5);
            
            // ドラッグ成功のフローティングテキスト
            this.gameScene.floatingTextManager.addAnimatedText(
                endPosition.x,
                endPosition.y - 30,
                'FLICK!',
                'gentle'
            );
        }
        
        // ビジュアルフィードバックをリセット
        this.gameScene.resetDragVisualization();
    }
}