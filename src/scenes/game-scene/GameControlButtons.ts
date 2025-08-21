import { InputCoordinateConverter  } from '../../utils/InputCoordinateConverter.js';''
import { ScaledCoordinateManager  } from '../../utils/ScaledCoordinateManager.js';''
import { UIPositionCalculator  } from '../../utils/UIPositionCalculator.js';''
import { ResponsiveCanvasManager  } from '../../managers/ResponsiveCanvasManager.js';''
import { GameUIManager  } from './GameUIManager.js';

/**
 * ゲームコントロールボタン管理クラス
 * Give Up（ギブアップ）とRestart（ゲーム再開始）ボタンを管理
 */

// Type definitions
interface ButtonSize { width: number,
    height: number ,}

interface ButtonStyle { backgroundColor: string;
    textColor: string;
    borderColor: string;
    hoverColor: string;
   , activeColor: string }

interface ButtonConfig { text: string;
    size: ButtonSize;
   , style: ButtonStyle;
    }
    position?: { x: number;, y: number }

interface ButtonConfigs { giveUp: ButtonConfig,
    restart: ButtonConfig
    ,}
';

interface ButtonState { enabled: boolean,''
    hoveredButton: 'giveUp' | 'restart' | null,
    activeButton: 'giveUp' | 'restart' | null, }
    lastMousePosition: { x: number;, y: number }

interface DeviceInfo { isTouchDevice: boolean,
    isMobile: boolean ,}

interface ButtonVisibility { giveUp: boolean;
   , restart: boolean }
';

interface AccessibilityState { ''
    focusedButton: 'giveUp' | 'restart' | null;
   , keyboardNavigation: boolean }

interface GameState { isGameStarted?: boolean;
    isGameOver?: boolean;
    isPaused?: boolean;
    isPreGame?: boolean; }

interface GameEngine { canvas: HTMLCanvasElement,
    responsiveCanvasManager?: ResponsiveCanvasManager
    }

interface ButtonBounds { x: number;
    y: number;
    width: number;
   , height: number }

export class GameControlButtons {
    private gameEngine: GameEngine;
    private uiManager: GameUIManager;
    private buttonConfig: ButtonConfigs;
    private buttonState: ButtonState;
    private deviceInfo: DeviceInfo;
    private buttonVisibility: ButtonVisibility;
    private accessibilityState: AccessibilityState;
    // Coordinate system components
    private uiPositionCalculator: UIPositionCalculator | null = null;
    private scaledCoordinateManager: ScaledCoordinateManager | null = null;
    private, inputCoordinateConverter: InputCoordinateConverter | null = null;

    constructor(gameEngine: GameEngine, uiManager: GameUIManager) {
        this.gameEngine = gameEngine;
        this.uiManager = uiManager;
        
        // ボタン設定（モバイル対応：最小44pxタッチターゲット）
        this.buttonConfig = {
            giveUp: {'
    ,}

                text: 'ギブアップ', }
                size: { width: 100, height: 36 ,},  // 右上端配置用にコンパクト化
                style: {;
                    backgroundColor: '#FF6B6B',
                    textColor: '#FFFFFF',
                    borderColor: '#FF5252',
                    hoverColor: '#FF8A80',
                    activeColor: '#FF5252'  // タッチ時のフィードバック色 ,}
            };
            restart: { ''
                text: 'ゲーム再開始', }
                size: { width: 100, height: 36 ,},  // 右上端配置用にコンパクト化
                style: { ''
                    backgroundColor: '#4CAF50',
                    textColor: '#FFFFFF',
                    borderColor: '#45A049',
                    hoverColor: '#66BB6A',
                    activeColor: '#45A049'  // タッチ時のフィードバック色 ,}
};
        // ボタン状態
        this.buttonState = { enabled: true,
            hoveredButton: null;
           , activeButton: null,  // タッチ/クリック中のボタン }
            lastMousePosition: { x: 0, y: 0 ,};
        
        // モバイルデバイス検出
        this.deviceInfo = { isTouchDevice: this.detectTouchDevice(),
            isMobile: this.detectMobileDevice( ,};
        
        // ボタン表示状態（ゲーム状態に応じて制御）
        this.buttonVisibility = { giveUp: false,   // 初期状態では非表示
            restart: false   // 初期状態では非表示 ,};
        // アクセシビリティ状態
        this.accessibilityState = { focusedButton: null,    // 現在フォーカスされているボタン
            keyboardNavigation: false  // キーボードナビゲーション中かどうか ,};
        // 座標変換システムを初期化
        this.initializeCoordinateSystem();
        
        // ボタン位置を計算
        this.updateButtonPositions();
    }
    
    /**
     * 座標変換システムを初期化
     */
    private initializeCoordinateSystem(): void { try {
            // UIManagerからUIPositionCalculatorとScaledCoordinateManagerを取得
            if (this.uiManager && (this.uiManager, as any).uiPositionCalculator) {
                this.uiPositionCalculator = (this.uiManager, as any).uiPositionCalculator;
                this.scaledCoordinateManager = (this.uiManager, as any).scaledCoordinateManager;
                // InputCoordinateConverterを初期化
                this.inputCoordinateConverter = new InputCoordinateConverter(this.scaledCoordinateManager); }

            } else {
                console.warn('GameControlButtons: UIManager coordinate system not available, using fallback');
                this.uiPositionCalculator = null;
                this.scaledCoordinateManager = null; }

                this.inputCoordinateConverter = null;' }'

            } catch (error) {
            console.error('GameControlButtons: Failed to initialize coordinate system', error);
            this.uiPositionCalculator = null;
            this.scaledCoordinateManager = null;
            this.inputCoordinateConverter = null; }
    }
    
    /**
     * タッチデバイスの検出
     * @returns タッチデバイスかどうか'
     */''
    private detectTouchDevice(''';
        return 'ontouchstart' in, window || navigator.maxTouchPoints > 0;
    }
    
    /**
     * モバイルデバイスの検出
     * @returns モバイルデバイスかどうか
     */)
    private detectMobileDevice(): boolean { return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768; }
    
    /**
     * ボタン位置の更新（レスポンシブ対応）
     */'
    public updateButtonPositions(): void { try {'
            if(this.uiPositionCalculator) {'
                // UIPositionCalculatorを使用した新しい実装
                const giveUpPosition = this.uiPositionCalculator.getButtonPosition('giveup', 0);''
                const restartPosition = this.uiPositionCalculator.getButtonPosition('restart', 1);
                
                // UIPositionCalculatorはすでにベース座標系で計算されているので、
                // 追加の変換は不要。直接使用する。
                this.buttonConfig.giveUp.position = giveUpPosition;
            }
                this.buttonConfig.restart.position = restartPosition; }
            } else {  // フォールバック: 既存のResponsiveCanvasManager実装
                const canvas = this.gameEngine.canvas;
                const rightMargin = 5;
                const topMargin = 5;
                const buttonSpacing = 10;
                
                let giveUpX: number, giveUpY: number, restartX: number, restartY: number,

                if(this.gameEngine.responsiveCanvasManager && typeof, this.gameEngine.responsiveCanvasManager.getScaledCoordinates === 'function) {'
                    const canvasInfo = this.gameEngine.responsiveCanvasManager.getCanvasInfo();
                    const baseWidth = canvasInfo ? canvasInfo.baseWidth: canvas.width,
                    
                    const baseGiveUpX = baseWidth - this.buttonConfig.giveUp.size.width - rightMargin;
                    const baseGiveUpY = topMargin;
                    const baseRestartX = baseWidth - this.buttonConfig.restart.size.width - rightMargin;
                    const baseRestartY = topMargin + this.buttonConfig.giveUp.size.height + buttonSpacing;
                    ';

                    const scaledGiveUp = this.gameEngine.responsiveCanvasManager.getScaledCoordinates(baseGiveUpX, baseGiveUpY);''
                    const scaledRestart = this.gameEngine.responsiveCanvasManager.getScaledCoordinates(baseRestartX, baseRestartY);
                    
                    // スケール済み座標をベース座標に戻す
                    const scale = canvasInfo.scale;
                    giveUpX = scaledGiveUp.x / scale;
                    giveUpY = scaledGiveUp.y / scale;
                }
                    restartX = scaledRestart.x / scale; }
                    restartY = scaledRestart.y / scale; }
                } else {
                    console.warn('GameControlButtons: No coordinate system available, using default positions');
                    giveUpX = rightMargin;
                    giveUpY = topMargin + 80;
                    restartX = rightMargin; }
                    restartY = topMargin + 80 + this.buttonConfig.giveUp.size.height + buttonSpacing; }
                }
                
                this.buttonConfig.giveUp.position = { x: giveUpX, y: giveUpY ,}

                this.buttonConfig.restart.position = { x: restartX, y: restartY ,}''
            } catch (error) {
            console.warn('GameControlButtons: Button position update failed', error);
            // 最終フォールバック }
            this.buttonConfig.giveUp.position = { x: 10, y: 90 ,}
            this.buttonConfig.restart.position = { x: 10, y: 140 ,}
    }
    
    /**
     * ボタンの有効/無効を設定
     * @param enabled - 有効フラグ
     */
    public setButtonsEnabled(enabled: boolean): void { this.buttonState.enabled = enabled;
        this.buttonState.hoveredButton = null; }
    
    /**
     * ゲーム状態に基づいてボタンの表示状態を更新
     * @param gameState - ゲーム状態
     */
    public updateButtonVisibility(gameState: GameState): void {
        const { isGameStarted = false, isGameOver = false, isPaused = false, isPreGame = false } = gameState;
        
        // Give Upボタンの表示条件: (ゲーム進行中 OR ポーズ中) AND ゲームオーバーでない AND ゲーム開始前でない
        this.buttonVisibility.giveUp = (isGameStarted && !isGameOver && !isPreGame);
        // Restartボタンの表示条件: (ゲーム進行中 OR ポーズ中 OR ゲームオーバー) AND ゲーム開始前でない
        this.buttonVisibility.restart = ((isGameStarted && !isPreGame) || isGameOver') && !isPreGame;
    }
    
    /**'
     * 指定されたボタンが表示状態かどうかを確認''
     * @param buttonType - ボタンタイプ ('giveUp' または 'restart'')
     * @returns 表示状態'
     */''
    public isButtonVisible(buttonType: 'giveUp' | 'restart): boolean { return this.buttonVisibility[buttonType] || false; }
    
    /**
     * キーボードナビゲーション処理
     * @param event - キーボードイベント
     * @returns イベントが処理されたかどうか
     */
    public handleKeyboardNavigation(event: KeyboardEvent): boolean { if (!this.buttonState.enabled) {
            return false; }
        
        const visibleButtons = this.getVisibleButtons();
        if (visibleButtons.length === 0) { return false; }

        switch(event.key) {'

            case 'Tab':;
                this.accessibilityState.keyboardNavigation = true;
                const direction = event.shiftKey ? -1 : 1;

                this.navigateButtons(direction, visibleButtons);''
                event.preventDefault(''';
            case 'Enter':)';
            case ', ':  // スペースキー);
                if (this.accessibilityState.focusedButton) {'
                    this.handleButtonActivation(this.accessibilityState.focusedButton);''
                    event.preventDefault()';
            case 'Escape':);
                this.clearKeyboardFocus();
        }
                return true;
        
        return false;
    }
    
    /**
     * 表示されているボタンの一覧を取得
     * @returns 表示されているボタンタイプの配列'
     */''
    private getVisibleButtons('): ('giveUp' | 'restart'')[] { ''
        const buttons: ('giveUp' | 'restart'')[] = [],
        if(this.isButtonVisible('giveUp)) buttons.push('giveUp'');''
        if(this.isButtonVisible('restart)) buttons.push('restart);
        return buttons; }
    
    /**'
     * ボタン間のナビゲーション''
     * @param direction - 方向 (1: 次へ, -1: 前へ')'
     * @param visibleButtons - 表示されているボタンの配列'
     */''
    private navigateButtons(direction: number, visibleButtons: ('giveUp' | 'restart)[]): void { if (visibleButtons.length === 0) return;
        
        let currentIndex = -1;
        if(this.accessibilityState.focusedButton) {
            
        }
            currentIndex = visibleButtons.indexOf(this.accessibilityState.focusedButton); }
        }
        ';

        const nextIndex = (currentIndex + direction + visibleButtons.length) % visibleButtons.length;''
        this.setKeyboardFocus(visibleButtons[nextIndex]);
    }
    
    /**
     * キーボードフォーカスを設定
     * @param buttonType - フォーカスするボタンタイプ'
     */''
    private setKeyboardFocus(buttonType: 'giveUp' | 'restart): void { this.accessibilityState.focusedButton = buttonType;
        this.accessibilityState.keyboardNavigation = true; }
    
    /**
     * キーボードフォーカスをクリア'
     */''
    public clearKeyboardFocus()';
    private handleButtonActivation(buttonType: 'giveUp' | 'restart): void { if(this.isButtonVisible(buttonType) {'
            // UIManagerのボタンクリック処理を呼び出し
            if(this.uiManager && typeof (this.uiManager, as any).showConfirmationDialog === 'function') {
                (this.uiManager, as any).showConfirmationDialog(buttonType); }
}
    }
    
    /**
     * タッチ開始処理
     * @param x - X座標
     * @param y - Y座標
     * @param event - タッチイベント（オプション）
     * @returns タッチされたボタンタイプ'
     */''
    public handleTouchStart(x: number, y: number, event: TouchEvent | null = null): 'giveUp' | 'restart' | null { if (!this.buttonState.enabled) {
            return null; }
        
        try {
            let convertedCoords = { x, y };
            
            // InputCoordinateConverterが利用可能な場合は座標変換を実行
            if(this.inputCoordinateConverter && event) {
                ';

            }

                convertedCoords = this.inputCoordinateConverter.convertTouchEvent(event); }
            }
            ';
            // 表示されているボタンのみタッチ処理（変換された座標でテスト）
            if (this.isButtonVisible('giveUp'') && this.isButtonClicked(convertedCoords.x, convertedCoords.y, 'giveUp)) { ''
                this.buttonState.activeButton = 'giveUp';''
                return 'giveUp';' }

            } else if (this.isButtonVisible('restart'') && this.isButtonClicked(convertedCoords.x, convertedCoords.y, 'restart)) { ''
                this.buttonState.activeButton = 'restart';''
                return 'restart';' }

            } catch (error) {
            console.warn('GameControlButtons: Touch start failed, using fallback', error);

            // フォールバック: 元の座標でタッチ判定
            if (this.isButtonVisible('giveUp'') && this.isButtonClicked(x, y, 'giveUp)) {''
                this.buttonState.activeButton = 'giveUp';''
                return 'giveUp';' }

            } else if (this.isButtonVisible('restart'') && this.isButtonClicked(x, y, 'restart)) { ''
                this.buttonState.activeButton = 'restart';''
                return 'restart';
        
        return null;
    }
    
    /**
     * タッチ終了処理
     * @param x - X座標
     * @param y - Y座標
     * @param event - タッチイベント（オプション）
     * @returns 完了したボタンタイプ'
     */''
    public handleTouchEnd(x: number, y: number, event: TouchEvent | null = null): 'giveUp' | 'restart' | null { const activeButton = this.buttonState.activeButton;
        this.buttonState.activeButton = null;
        
        if(!this.buttonState.enabled || !activeButton) {
        
            
        
        }
            return null;
        
        try {
            let convertedCoords = { x, y };
            
            // InputCoordinateConverterが利用可能な場合は座標変換を実行
            if (this.inputCoordinateConverter && event) { convertedCoords = this.inputCoordinateConverter.convertTouchEvent(event); }
            
            // タッチ終了位置が同じボタン内であれば実行（変換された座標でテスト）
            if(this.isButtonClicked(convertedCoords.x, convertedCoords.y, activeButton) { return activeButton;' }'

            } catch (error) {
            console.warn('GameControlButtons: Touch end failed, using fallback', error);
            // フォールバック: 元の座標でタッチ判定
            if(this.isButtonClicked(x, y, activeButton) {
                
            }
                return activeButton;
        
        return null;
    }
    
    /**
     * タッチキャンセル処理
     */
    public handleTouchCancel(): void { this.buttonState.activeButton = null; }
    
    /**
     * マウス座標の更新（ホバー状態管理用）
     * @param x - X座標
     * @param y - Y座標
     * @param event - 元のイベントオブジェクト（座標変換用）
     */
    public updateMousePosition(x: number, y: number, event: Event | null = null): void {
        this.buttonState.lastMousePosition = { x, y };
        
        if(!this.buttonState.enabled) {
        
            this.buttonState.hoveredButton = null;
        
        }
            return; }
        }
        
        try {
            let convertedCoords = { x, y };
            
            // InputCoordinateConverterが利用可能な場合は座標変換を実行
            // クリック検出と同じ座標システムを使用することで一貫性を保つ
            if(this.inputCoordinateConverter && event) {'

                if(event.type && event.type.includes('touch) {'
            }
                    convertedCoords = this.inputCoordinateConverter.convertTouchEvent(event, as TouchEvent); }

                } else { }'

                    convertedCoords = this.inputCoordinateConverter.convertMouseEvent(event, as MouseEvent); }
}
            
            // ホバー状態の更新（表示されているボタンのみ、変換された座標を使用）
            this.buttonState.hoveredButton = null;''
            if (this.isButtonVisible('giveUp'') && this.isButtonClicked(convertedCoords.x, convertedCoords.y, 'giveUp)) { ''
                this.buttonState.hoveredButton = 'giveUp';' }

            } else if (this.isButtonVisible('restart'') && this.isButtonClicked(convertedCoords.x, convertedCoords.y, 'restart)) { ''
                this.buttonState.hoveredButton = 'restart';' }

            } catch (error) {
            console.warn('GameControlButtons: Mouse position update failed, using fallback', error);
            // フォールバック: 元の座標でテスト
            this.buttonState.hoveredButton = null;''
            if (this.isButtonVisible('giveUp'') && this.isButtonClicked(x, y, 'giveUp)) {''
                this.buttonState.hoveredButton = 'giveUp';' }

            } else if (this.isButtonVisible('restart'') && this.isButtonClicked(x, y, 'restart)) { ''
                this.buttonState.hoveredButton = 'restart'; }
}
    
    /**
     * クリック処理
     * @param x - X座標
     * @param y - Y座標
     * @param event - マウス/タッチイベント（オプション）
     * @returns クリックされたボタンタイプ'
     */''
    public handleClick(x: number, y: number, event: Event | null = null): 'giveUp' | 'restart' | null { if (!this.buttonState.enabled) {
            return null; }
        
        try {
            let convertedCoords = { x, y };
            ';
            // InputCoordinateConverterが利用可能な場合は座標変換を実行
            if(this.inputCoordinateConverter && event) {'

                if(event.type && event.type.includes('touch) {'
            }
                    convertedCoords = this.inputCoordinateConverter.convertTouchEvent(event, as TouchEvent); }

                } else { }'

                    convertedCoords = this.inputCoordinateConverter.convertMouseEvent(event, as MouseEvent); }
}
            ';
            // 変換された座標でボタンクリック判定
            if (this.isButtonVisible('giveUp'') && this.isButtonClicked(convertedCoords.x, convertedCoords.y, 'giveUp)) { ''
                return 'giveUp';' }

            } else if (this.isButtonVisible('restart'') && this.isButtonClicked(convertedCoords.x, convertedCoords.y, 'restart)) { ''
                return 'restart';' }

            } catch (error) {
            console.warn('GameControlButtons: Click detection failed, using fallback', error);

            // フォールバック: 元の座標でテスト
            if (this.isButtonVisible('giveUp'') && this.isButtonClicked(x, y, 'giveUp)) {''
                return 'giveUp';' }

            } else if (this.isButtonVisible('restart'') && this.isButtonClicked(x, y, 'restart)) { ''
                return 'restart';
        
        return null;
    }
    
    /**
     * ボタンがクリックされたかの判定
     * @param x - X座標
     * @param y - Y座標
     * @param buttonType - ボタンタイプ
     * @returns クリック判定結果'
     */''
    private isButtonClicked(x: number, y: number, buttonType: 'giveUp' | 'restart): boolean { const config = this.buttonConfig[buttonType];
        if(!config || !config.position) {
            
        }
            return false;

        const bounds = this.getButtonBounds(buttonType);
        return x >= bounds.x && x <= bounds.x + bounds.width &&;
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    /**
     * ボタンの境界情報を取得（ベース座標系）
     * @param buttonType - ボタンタイプ
     * @returns 境界情報'
     */''
    private getButtonBounds(buttonType: 'giveUp' | 'restart): ButtonBounds { const config = this.buttonConfig[buttonType];
        if (!config || !config.position) { }
            return { x: 0, y: 0, width: 0, height: 0 ,}
        ';
        // ベース座標系での境界情報を返す
        // これによりisButtonClicked()
    private getScaledButtonBounds(buttonType: 'giveUp' | 'restart): ButtonBounds { const config = this.buttonConfig[buttonType];
        if (!config || !config.position) { }
            return { x: 0, y: 0, width: 0, height: 0 ,}
        
        try { if (this.scaledCoordinateManager) {
                // 新しい座標システムを使用
                const scaledPosition = this.scaledCoordinateManager.getScaledPosition(config.position.x, config.position.y);
                const scaledSize = this.scaledCoordinateManager.getScaledSize(config.size.width, config.size.height);
                
                return { x: scaledPosition.x,
                    y: scaledPosition.y;
                   , width: scaledSize.width, };
                    height: scaledSize.height }
                } else {  // フォールバック: 既存のResponsiveCanvasManagerを使用
                let scaleFactor = 1;
                if(this.gameEngine && this.gameEngine.responsiveCanvasManager) {
                    
                }
                    const canvasInfo = this.gameEngine.responsiveCanvasManager.getCanvasInfo(); }
                    scaleFactor = canvasInfo ? canvasInfo.scale: 1 
                }
                
                return { x: config.position.x,
                    y: config.position.y;
                   , width: config.size.width * scaleFactor, };
                    height: config.size.height * scaleFactor }
                };''
            } catch (error) {
            console.warn('GameControlButtons: Failed to get scaled button bounds', error);
            return { x: config.position.x,
                y: config.position.y;
               , width: config.size.width, };
                height: config.size.height }
            }
    }
    
    /**
     * ボタンの描画
     * @param context - 描画コンテキスト
     */
    public render(context: CanvasRenderingContext2D): void { if (!this.buttonState.enabled) {
            return; }
        
        // キャンバスサイズが変更された場合の位置更新
        this.updateButtonPositions();

        context.save()';
        if(this.isButtonVisible('giveUp)) { ''
            this.renderButton(context, 'giveUp''); }
        ';
        // Restartボタンの描画（表示状態の場合のみ）
        if(this.isButtonVisible('restart)) { ''
            this.renderButton(context, 'restart); }'

        context.restore()';
    private renderButton(context: CanvasRenderingContext2D, buttonType: 'giveUp' | 'restart): void { const config = this.buttonConfig[buttonType];
        const isHovered = this.buttonState.hoveredButton === buttonType;
        const isFocused = this.accessibilityState.focusedButton === buttonType;
        const isActive = this.buttonState.activeButton === buttonType;
        const bounds = this.getScaledButtonBounds(buttonType); // 描画にはスケーリングされた境界を使用
        
        if(bounds.width === 0 || bounds.height === 0) {
        
            
        
        }
            return; }
        }
        
        // ボタン背景色（優先度：アクティブ > ホバー > 通常）
        let backgroundColor = config.style.backgroundColor;
        if (isActive) { backgroundColor = config.style.activeColor || config.style.borderColor; } else if (isHovered && !this.deviceInfo.isTouchDevice) { backgroundColor = config.style.hoverColor; }
        
        // ボタンの背景描画
        context.fillStyle = backgroundColor;
        context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // ボタンの枠線描画
        context.strokeStyle = config.style.borderColor;
        context.lineWidth = 2;
        context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // キーボードフォーカス表示
        if (isFocused && this.accessibilityState.keyboardNavigation) { this.renderFocusIndicator(context, bounds); }
        
        // タッチフィードバック（アクティブ状態の視覚効果）
        if(isActive) {
            ';

        }

            this.renderTouchFeedback(context, bounds); }
        }
        
        // ボタンテキストの描画（モバイル対応でフォントサイズ調整）
        context.fillStyle = config.style.textColor;
        const fontSize = this.deviceInfo.isMobile ? 13 : 14;
        context.font = `bold ${fontSize}px Arial`;''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';
        ';
        // 影効果
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur = 2;
        
        const textX = bounds.x + bounds.width / 2;

        const textY = bounds.y + bounds.height / 2;''
        context.fillText(config.text, textX, textY);
        ';
        // 影効果をクリア
        context.shadowColor = 'transparent';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    }
    
    /**
     * タッチフィードバックの描画
     * @param context - 描画コンテキスト
     * @param bounds - ボタンの境界情報
     */
    private renderTouchFeedback(context: CanvasRenderingContext2D, bounds: ButtonBounds): void { context.save();
        
        // 内側に少し明るいハイライト効果
        const gradient = context.createLinearGradient(;
            bounds.x, bounds.y );
            bounds.x, bounds.y + bounds.height)'';
        ');''
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)'');''
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1));
        
        context.fillStyle = gradient;
        context.fillRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);
        
        context.restore(); }
    
    /**
     * フォーカスインジケーターの描画
     * @param context - 描画コンテキスト
     * @param bounds - ボタンの境界情報
     */
    private renderFocusIndicator(context: CanvasRenderingContext2D, bounds: ButtonBounds): void { const focusOffset = 3;
        const focusLineWidth = 3;

        context.save(''';
        context.strokeStyle = '#007BFF'; // アクセシブルな青色)
        context.lineWidth = focusLineWidth;)
        context.setLineDash([5, 3]); // 点線スタイル
        
        // フォーカス枠を描画
        context.strokeRect(;
            bounds.x - focusOffset);
            bounds.y - focusOffset);
            bounds.width + focusOffset * 2,);
            bounds.height + focusOffset * 2);
        
        context.restore(); }
    
    /**
     * ボタンの設定を取得
     * @returns ボタン設定
     */
    public getButtonConfig(): ButtonConfigs {
        return { ...this.buttonConfig;
    }
    
    /**
     * ボタンの状態を取得
     * @returns ボタン状態
     */''
    public getButtonState(');