/**
 * ゲーム専用入力管理クラス
 */
import { InputManager } from '../core/InputManager';
import { EnhancedTouchManager } from '../core/EnhancedTouchManager';
import { getBrowserCompatibility } from '../utils/BrowserCompatibility';
import { InputCoordinateConverter } from '../utils/InputCoordinateConverter';

interface Position {
    x: number;
    y: number;
    originalEvent?: MouseEvent | TouchEvent;
}

interface DragVector {
    x: number;
    y: number;
}

interface TouchData {
    position: Position;
}

interface GestureData {
    position?: Position;
    startPosition?: Position;
    endPosition?: Position;
    direction?: string;
    velocity?: number;
    scale?: number;
    center?: Position;
}

export class GameInputManager extends InputManager {
    private gameScene: any;
    private gameEngine: any;
    private inputCoordinateConverter: InputCoordinateConverter | null = null;
    private enhancedTouchManager?: EnhancedTouchManager;
    
    constructor(canvas: HTMLCanvasElement, gameScene: any) {
        super(canvas);
        this.gameScene = gameScene;
        this.gameEngine = gameScene.gameEngine;
        
        // 座標変換システムの初期化
        this.initializeCoordinateConverter();
        
        // モバイルデバイスの場合はEnhancedTouchManagerを使用
        if (getBrowserCompatibility().deviceInfo.isMobile) {
            this.setupEnhancedTouch();
        }
    }
    
    /**
     * 座標変換システムの初期化
     */
    private initializeCoordinateConverter(): void {
        try {
            // GameEngineからResponsiveCanvasManagerとScaledCoordinateManagerを取得
            const responsiveCanvasManager = this.gameEngine?.responsiveCanvasManager;
            if (responsiveCanvasManager && responsiveCanvasManager.scaledCoordinateManager) {
                this.inputCoordinateConverter = new InputCoordinateConverter(
                    responsiveCanvasManager.scaledCoordinateManager
                );
                console.log('GameInputManager: InputCoordinateConverter initialized');
            } else {
                console.warn('GameInputManager: ScaledCoordinateManager not available, coordinate conversion disabled');
                this.inputCoordinateConverter = null;
            }
        } catch (error) {
            console.error('GameInputManager: Failed to initialize coordinate converter', error);
            this.inputCoordinateConverter = null;
        }
    }
    
    /**
     * クリック処理
     */
    notifyClick(position: Position): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 座標変換（InputCoordinateConverterが利用可能な場合）
        let convertedPosition = position;
        try {
            if (this.inputCoordinateConverter && position.originalEvent) {
                const converted = this.inputCoordinateConverter.convertMouseEvent(position.originalEvent as MouseEvent);
                convertedPosition = {
                    x: converted.x,
                    y: converted.y
                };
            }
        } catch (error) {
            console.warn('GameInputManager: Coordinate conversion failed for click, using original position', error);
        }
        
        // 泡のクリック処理（変換された座標を使用）
        const bubbleClicked = this.gameEngine.bubbleManager.handleClick(convertedPosition.x, convertedPosition.y);
        
        // クリック位置にフィードバック（変換された座標を使用）
        if (bubbleClicked) {
            this.gameScene.createDragParticles(convertedPosition.x, convertedPosition.y, 20);
        }
    }
    
    /**
     * ポインター移動処理
     */
    notifyPointerMove(position: Position): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) {
            return;
        }
        
        // 座標変換（InputCoordinateConverterが利用可能な場合）
        let convertedPosition = position;
        try {
            if (this.inputCoordinateConverter && position.originalEvent) {
                const converted = this.inputCoordinateConverter.convertMouseEvent(position.originalEvent as MouseEvent);
                convertedPosition = {
                    x: converted.x,
                    y: converted.y
                };
            }
        } catch (error) {
            console.warn('GameInputManager: Coordinate conversion failed for pointer move, using original position', error);
        }
        
        // マウス位置の更新（変換された座標を使用）
        this.gameEngine.bubbleManager.updateMousePosition(convertedPosition.x, convertedPosition.y);
    }
    
    /**
     * ドラッグ開始処理
     */
    notifyDragStart(startPosition: Position): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 座標変換（InputCoordinateConverterが利用可能な場合）
        let convertedPosition = startPosition;
        try {
            if (this.inputCoordinateConverter && startPosition.originalEvent) {
                const converted = this.inputCoordinateConverter.convertMouseEvent(startPosition.originalEvent as MouseEvent);
                convertedPosition = {
                    x: converted.x,
                    y: converted.y
                };
            }
        } catch (error) {
            console.warn('GameInputManager: Coordinate conversion failed for drag start, using original position', error);
        }
        
        // ドラッグ対象の泡を検索（変換された座標を使用）
        const targetBubble = this.gameEngine.bubbleManager.handleDragStart(convertedPosition.x, convertedPosition.y);
        
        // ビジュアルフィードバックを開始（変換された座標を使用）
        if (this.gameScene && typeof this.gameScene.startDragVisualization === 'function') {
            this.gameScene.startDragVisualization(convertedPosition, targetBubble);
        } else {
            console.warn('GameInputManager: startDragVisualization method not available on current scene');
        }
    }
    
    /**
     * ドラッグ移動処理
     */
    notifyDragMove(currentPosition: Position): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 座標変換（InputCoordinateConverterが利用可能な場合）
        let convertedPosition = currentPosition;
        try {
            if (this.inputCoordinateConverter && currentPosition.originalEvent) {
                const converted = this.inputCoordinateConverter.convertMouseEvent(currentPosition.originalEvent as MouseEvent);
                convertedPosition = {
                    x: converted.x,
                    y: converted.y
                };
            }
        } catch (error) {
            console.warn('GameInputManager: Coordinate conversion failed for drag move, using original position', error);
        }
        
        // ビジュアルフィードバックを更新（変換された座標を使用）
        if (this.gameScene && typeof this.gameScene.updateDragVisualizationPosition === 'function') {
            this.gameScene.updateDragVisualizationPosition(convertedPosition);
        }
        
        // BubbleManagerのドラッグ移動も呼び出し（変換された座標を使用）
        this.gameEngine.bubbleManager.handleDragMove(convertedPosition.x, convertedPosition.y);
    }
    
    /**
     * ドラッグ終了処理
     */
    notifyDragEnd(startPosition: Position, endPosition: Position, dragVector: DragVector): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 座標変換（InputCoordinateConverterが利用可能な場合）
        let convertedStartPosition = startPosition;
        let convertedEndPosition = endPosition;
        try {
            if (this.inputCoordinateConverter) {
                if (startPosition.originalEvent) {
                    const convertedStart = this.inputCoordinateConverter.convertMouseEvent(startPosition.originalEvent as MouseEvent);
                    convertedStartPosition = {
                        x: convertedStart.x,
                        y: convertedStart.y
                    };
                }
                if (endPosition.originalEvent) {
                    const convertedEnd = this.inputCoordinateConverter.convertMouseEvent(endPosition.originalEvent as MouseEvent);
                    convertedEndPosition = {
                        x: convertedEnd.x,
                        y: convertedEnd.y
                    };
                }
            }
        } catch (error) {
            console.warn('GameInputManager: Coordinate conversion failed for drag end, using original positions', error);
        }
        
        // 泡を吹き飛ばす処理（変換された座標を使用）
        const success = this.gameEngine.bubbleManager.handleDragEnd(
            convertedStartPosition.x, 
            convertedStartPosition.y, 
            convertedEndPosition.x, 
            convertedEndPosition.y
        );
        
        if (success) {
            // パーティクル効果を生成（変換された座標を使用）
            const force = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
            this.gameScene.createDragParticles(convertedEndPosition.x, convertedEndPosition.y, force / 5);
            
            // ドラッグ成功のフローティングテキスト（変換された座標を使用）
            this.gameScene.floatingTextManager.addAnimatedText(
                convertedEndPosition.x,
                convertedEndPosition.y - 30,
                'FLICK!',
                'gentle'
            );
        }
        
        // ビジュアルフィードバックをリセット
        if (this.gameScene && typeof this.gameScene.resetDragVisualization === 'function') {
            this.gameScene.resetDragVisualization();
        }
    }
    
    /**
     * Enhanced Touch Manager のセットアップ
     */
    private setupEnhancedTouch(): void {
        this.enhancedTouchManager = new EnhancedTouchManager(this.canvas, this.gameEngine);
        
        // タッチコールバックの登録
        this.enhancedTouchManager.registerCallback('onTouchStart', (touchData: TouchData) => {
            this.notifyPointerDown(touchData.position);
        });
        
        this.enhancedTouchManager.registerCallback('onTouchMove', (touchData: TouchData) => {
            this.notifyPointerMove(touchData.position);
        });
        
        this.enhancedTouchManager.registerCallback('onTouchEnd', (touchData: TouchData) => {
            this.notifyClick(touchData.position);
        });
        
        // ジェスチャーコールバックの登録
        this.enhancedTouchManager.registerCallback('onSwipe', (gestureData: GestureData) => {
            this.handleSwipeGesture(gestureData);
        });
        
        this.enhancedTouchManager.registerCallback('onPinch', (gestureData: GestureData) => {
            this.handlePinchGesture(gestureData);
        });
        
        this.enhancedTouchManager.registerCallback('onDoubleTap', (gestureData: GestureData) => {
            this.handleDoubleTapGesture(gestureData);
        });
        
        this.enhancedTouchManager.registerCallback('onLongPress', (gestureData: GestureData) => {
            this.handleLongPressGesture(gestureData);
        });
    }
    
    /**
     * スワイプジェスチャー処理
     */
    private handleSwipeGesture(gestureData: GestureData): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // スワイプで複数のバブルを吹き飛ばす
        const swipeForce = (gestureData.velocity || 0) * 500;
        const swipeVector = {
            x: Math.cos(this.getAngleFromDirection(gestureData.direction || 'right')) * swipeForce,
            y: Math.sin(this.getAngleFromDirection(gestureData.direction || 'right')) * swipeForce
        };
        
        // スワイプパス上のバブルを検出
        if (gestureData.startPosition && gestureData.endPosition) {
            const bubbles = this.gameEngine.bubbleManager.getBubblesAlongPath(
                gestureData.startPosition,
                gestureData.endPosition
            );
            
            // バブルを吹き飛ばす
            bubbles.forEach((bubble: any) => {
                bubble.applyForce(swipeVector.x, swipeVector.y);
            });
            
            // エフェクト表示
            this.gameScene.createSwipeEffect(
                gestureData.startPosition,
                gestureData.endPosition,
                gestureData.direction
            );
        }
    }
    
    /**
     * ピンチジェスチャー処理
     */
    private handlePinchGesture(gestureData: GestureData): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // ピンチによるズーム効果（将来的な機能のプレースホルダー）
        // 現在はビジュアルエフェクトのみ
        if (gestureData.center && gestureData.scale !== undefined) {
            this.gameScene.createPinchEffect(gestureData.center, gestureData.scale);
        }
    }
    
    /**
     * ダブルタップジェスチャー処理
     */
    private handleDoubleTapGesture(gestureData: GestureData): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // ダブルタップで範囲内のバブルを一度にポップ
        const radius = 100;
        if (gestureData.position) {
            const bubbles = this.gameEngine.bubbleManager.getBubblesInRadius(
                gestureData.position.x,
                gestureData.position.y,
                radius
            );
            
            bubbles.forEach((bubble: any) => {
                if (bubble.canBePoppedByClick()) {
                    bubble.pop();
                }
            });
            
            // エフェクト表示
            this.gameScene.createRadialBurstEffect(gestureData.position, radius);
        }
    }
    
    /**
     * 長押しジェスチャー処理
     */
    private handleLongPressGesture(gestureData: GestureData): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) return;
        
        // 長押しで特殊アクション（例：時間停止効果）
        if (this.gameEngine.activateSpecialPower && gestureData.position) {
            this.gameEngine.activateSpecialPower('timestop', gestureData.position);
        }
        
        // エフェクト表示
        if (gestureData.position) {
            this.gameScene.createLongPressEffect(gestureData.position);
        }
    }
    
    /**
     * 方向からラジアン角度を取得
     */
    private getAngleFromDirection(direction: string): number {
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
    updateTouchSettings(settings: any): void {
        if (this.enhancedTouchManager) {
            this.enhancedTouchManager.configureTouchSettings(settings);
        }
    }
    
    /**
     * クリーンアップ（オーバーライド）
     */
    cleanup(): void {
        super.cleanup();
        
        if (this.enhancedTouchManager) {
            this.enhancedTouchManager.cleanup();
        }
    }
}