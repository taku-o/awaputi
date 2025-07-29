/**
 * ゲーム専用入力管理クラス
 */
import { InputManager } from '../core/InputManager.js';
import { EnhancedTouchManager } from '../core/EnhancedTouchManager.js';
import { getBrowserCompatibility } from '../utils/BrowserCompatibility.js';

export class GameInputManager extends InputManager {
    constructor(canvas, gameScene) {
        super(canvas);
        this.gameScene = gameScene;
        this.gameEngine = gameScene.gameEngine;
        
        // モバイルデバイスの場合はEnhancedTouchManagerを使用
        if (getBrowserCompatibility().deviceInfo.isMobile) {
            this.setupEnhancedTouch();
        }
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
    
    /**
     * Enhanced Touch Manager のセットアップ
     */
    setupEnhancedTouch() {
        this.enhancedTouchManager = new EnhancedTouchManager(this.canvas, this.gameEngine);
        
        // タッチコールバックの登録
        this.enhancedTouchManager.registerCallback('onTouchStart', (touchData) => {
            this.notifyPointerDown(touchData.position);
        });
        
        this.enhancedTouchManager.registerCallback('onTouchMove', (touchData) => {
            this.notifyPointerMove(touchData.position);
        });
        
        this.enhancedTouchManager.registerCallback('onTouchEnd', (touchData) => {
            this.notifyClick(touchData.position);
        });
        
        // ジェスチャーコールバックの登録
        this.enhancedTouchManager.registerCallback('onSwipe', (gestureData) => {
            this.handleSwipeGesture(gestureData);
        });
        
        this.enhancedTouchManager.registerCallback('onPinch', (gestureData) => {
            this.handlePinchGesture(gestureData);
        });
        
        this.enhancedTouchManager.registerCallback('onDoubleTap', (gestureData) => {
            this.handleDoubleTapGesture(gestureData);
        });
        
        this.enhancedTouchManager.registerCallback('onLongPress', (gestureData) => {
            this.handleLongPressGesture(gestureData);
        });
    }
    
    /**
     * スワイプジェスチャー処理
     */
    handleSwipeGesture(gestureData) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // スワイプで複数のバブルを吹き飛ばす
        const swipeForce = gestureData.velocity * 500;
        const swipeVector = {
            x: Math.cos(this.getAngleFromDirection(gestureData.direction)) * swipeForce,
            y: Math.sin(this.getAngleFromDirection(gestureData.direction)) * swipeForce
        };
        
        // スワイプパス上のバブルを検出
        const bubbles = this.gameEngine.bubbleManager.getBubblesAlongPath(
            gestureData.startPosition,
            gestureData.endPosition
        );
        
        // バブルを吹き飛ばす
        bubbles.forEach(bubble => {
            bubble.applyForce(swipeVector.x, swipeVector.y);
        });
        
        // エフェクト表示
        this.gameScene.createSwipeEffect(
            gestureData.startPosition,
            gestureData.endPosition,
            gestureData.direction
        );
    }
    
    /**
     * ピンチジェスチャー処理
     */
    handlePinchGesture(gestureData) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // ピンチによるズーム効果（将来的な機能のプレースホルダー）
        // 現在はビジュアルエフェクトのみ
        this.gameScene.createPinchEffect(gestureData.center, gestureData.scale);
    }
    
    /**
     * ダブルタップジェスチャー処理
     */
    handleDoubleTapGesture(gestureData) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // ダブルタップで範囲内のバブルを一度にポップ
        const radius = 100;
        const bubbles = this.gameEngine.bubbleManager.getBubblesInRadius(
            gestureData.position.x,
            gestureData.position.y,
            radius
        );
        
        bubbles.forEach(bubble => {
            if (bubble.canBePoppedByClick()) {
                bubble.pop();
            }
        });
        
        // エフェクト表示
        this.gameScene.createRadialBurstEffect(gestureData.position, radius);
    }
    
    /**
     * 長押しジェスチャー処理
     */
    handleLongPressGesture(gestureData) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // 長押しで特殊アクション（例：時間停止効果）
        if (this.gameEngine.activateSpecialPower) {
            this.gameEngine.activateSpecialPower('timestop', gestureData.position);
        }
        
        // エフェクト表示
        this.gameScene.createLongPressEffect(gestureData.position);
    }
    
    /**
     * 方向からラジアン角度を取得
     */
    getAngleFromDirection(direction) {
        switch (direction) {
            case 'right': return 0;
            case 'down': return Math.PI / 2;
            case 'left': return Math.PI;
            case 'up': return -Math.PI / 2;
            default: return 0;
        }
    }
    
    /**
     * タッチ設定の更新
     */
    updateTouchSettings(settings) {
        if (this.enhancedTouchManager) {
            this.enhancedTouchManager.configureTouchSettings(settings);
        }
    }
    
    /**
     * クリーンアップ（オーバーライド）
     */
    cleanup() {
        super.cleanup();
        
        if (this.enhancedTouchManager) {
            this.enhancedTouchManager.cleanup();
        }
    }
}