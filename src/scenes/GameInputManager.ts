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
    notifyDragEnd(endPosition: Position): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 座標変換（InputCoordinateConverterが利用可能な場合）
        let convertedPosition = endPosition;
        try {
            if (this.inputCoordinateConverter && endPosition.originalEvent) {
                const converted = this.inputCoordinateConverter.convertMouseEvent(endPosition.originalEvent as MouseEvent);
                convertedPosition = {
                    x: converted.x,
                    y: converted.y
                };
            }
        } catch (error) {
            console.warn('GameInputManager: Coordinate conversion failed for drag end, using original position', error);
        }
        
        // ドラッグ終了処理（変換された座標を使用）
        this.gameEngine.bubbleManager.handleDragEnd(convertedPosition.x, convertedPosition.y);
        
        // ビジュアルフィードバックを終了（変換された座標を使用）
        if (this.gameScene && typeof this.gameScene.endDragVisualization === 'function') {
            this.gameScene.endDragVisualization(convertedPosition);
        } else {
            console.warn('GameInputManager: endDragVisualization method not available on current scene');
        }
    }
    
    /**
     * タッチジェスチャー処理
     */
    notifyGesture(gestureData: GestureData): void {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // ピンチ操作のズーム処理
        if (gestureData.scale && gestureData.center) {
            let convertedCenter = gestureData.center;
            try {
                if (this.inputCoordinateConverter && gestureData.center.originalEvent) {
                    const converted = this.inputCoordinateConverter.convertMouseEvent(gestureData.center.originalEvent as MouseEvent);
                    convertedCenter = {
                        x: converted.x,
                        y: converted.y
                    };
                }
            } catch (error) {
                console.warn('GameInputManager: Coordinate conversion failed for gesture, using original position', error);
            }
            
            if (this.gameScene && typeof this.gameScene.handleZoom === 'function') {
                this.gameScene.handleZoom(gestureData.scale, convertedCenter);
            }
        }
        
        // スワイプ操作の処理
        if (gestureData.direction && gestureData.velocity) {
            if (this.gameScene && typeof this.gameScene.handleSwipe === 'function') {
                this.gameScene.handleSwipe(gestureData.direction, gestureData.velocity);
            }
        }
    }
    
    /**
     * EnhancedTouchManagerのセットアップ
     */
    private setupEnhancedTouch(): void {
        try {
            this.enhancedTouchManager = new EnhancedTouchManager(this.canvas);
            
            // タッチイベントのバインディング
            this.enhancedTouchManager.onTouchStart = (touchData: TouchData) => {
                this.notifyDragStart(touchData.position);
            };
            
            this.enhancedTouchManager.onTouchMove = (touchData: TouchData) => {
                this.notifyDragMove(touchData.position);
                this.notifyPointerMove(touchData.position);
            };
            
            this.enhancedTouchManager.onTouchEnd = (touchData: TouchData) => {
                this.notifyDragEnd(touchData.position);
            };
            
            this.enhancedTouchManager.onTap = (touchData: TouchData) => {
                this.notifyClick(touchData.position);
            };
            
            this.enhancedTouchManager.onGesture = (gestureData: GestureData) => {
                this.notifyGesture(gestureData);
            };
            
            console.log('GameInputManager: EnhancedTouchManager setup complete');
        } catch (error) {
            console.error('GameInputManager: Failed to setup EnhancedTouchManager', error);
            this.enhancedTouchManager = undefined;
        }
    }
    
    /**
     * 入力の有効化/無効化
     */
    public setInputEnabled(enabled: boolean): void {
        this.gameEngine.inputDisabled = !enabled;
        
        if (this.enhancedTouchManager) {
            this.enhancedTouchManager.setEnabled(enabled);
        }
    }
    
    /**
     * 座標変換器の更新
     */
    public updateCoordinateConverter(): void {
        this.initializeCoordinateConverter();
    }
    
    /**
     * デバッグ情報の取得
     */
    public getDebugInfo(): { [key: string]: any } {
        return {
            hasCoordinateConverter: !!this.inputCoordinateConverter,
            hasEnhancedTouch: !!this.enhancedTouchManager,
            inputEnabled: !this.gameEngine.inputDisabled,
            deviceInfo: getBrowserCompatibility().deviceInfo,
            gameState: {
                isPaused: this.gameScene.isPaused,
                isGameOver: this.gameEngine.isGameOver
            }
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    public cleanup(): void {
        if (this.enhancedTouchManager) {
            this.enhancedTouchManager.cleanup();
            this.enhancedTouchManager = undefined;
        }
        
        this.inputCoordinateConverter = null;
        
        // 基底クラスのクリーンアップ
        super.cleanup?.();
        
        console.log('GameInputManager: Cleanup completed');
    }
}