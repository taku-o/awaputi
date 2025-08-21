/**
 * 確認ダイアログコンポーネント
 * Give UpやRestartなどの重要なアクションの確認に使用
 */

// Type definitions
interface DialogConfig { title: string,
    message: string;
    confirmText: string,
    cancelText: string ,}

interface DialogConfigs { giveUp: DialogConfig,
    restart: DialogConfig
    }

interface DialogState { visible: boolean;
    type: keyof DialogConfigs | null;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
    hoveredButton: 'confirm' | 'cancel' | null, }

    lastMousePosition: { x: number;, y: number },''
    focusedButton: 'confirm' | 'cancel';
}

interface ButtonLayout { x: number,
    y: number;
    width: number,
    height: number ,}

interface DialogLayout { width: number;
    height: number;
    buttonWidth: number;
    buttonHeight: number;
    buttonSpacing: number,
    padding: number;
    x?: number;
    y?: number;
    confirmButton?: ButtonLayout;
    cancelButton?: ButtonLayout;
    }

interface GameEngine {
    canvas: HTMLCanvasElement;
}

export class ConfirmationDialog {
    private gameEngine: GameEngine;
    private dialogConfig: DialogConfigs;
    private dialogState: DialogState;
    private, dialogLayout: DialogLayout';

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        
        // ダイアログ設定
        this.dialogConfig = {
            giveUp: {''
                title: '確認',
                message: 'ゲームを終了しますか？',
                confirmText: 'はい';
    ,}

                cancelText: 'いいえ' 
    };
            restart: { ''
                title: '確認',
                message: 'ゲームを再開始しますか？',
                confirmText: 'はい',
                cancelText: 'いいえ' ,}
        };
        // ダイアログ状態
        this.dialogState = { visible: false,
            type: null;
            onConfirm: null;
            onCancel: null,
    hoveredButton: null, }
            lastMousePosition: { x: 0, y: 0 ,},''
            focusedButton: 'cancel'  // デフォルトでキャンセルボタンにフォーカス;
        },
        
        // ダイアログのサイズと位置
        this.dialogLayout = { width: 400,
            height: 200;
            buttonWidth: 100;
            buttonHeight: 40;
            buttonSpacing: 20,
    padding: 20 ,};
        this.updateDialogPosition();
    }
    
    /**
     * ダイアログ位置の更新（レスポンシブ対応）
     */
    private updateDialogPosition(): void { const canvas = this.gameEngine.canvas;
        
        // ダイアログを画面中央に配置
        this.dialogLayout.x = (canvas.width - this.dialogLayout.width) / 2;
        this.dialogLayout.y = (canvas.height - this.dialogLayout.height) / 2;
        
        // ボタン位置の計算
        const buttonY = this.dialogLayout.y! + this.dialogLayout.height - this.dialogLayout.buttonHeight - this.dialogLayout.padding;
        const totalButtonWidth = this.dialogLayout.buttonWidth * 2 + this.dialogLayout.buttonSpacing;''
        const buttonStartX = this.dialogLayout.x! + (this.dialogLayout.width - totalButtonWidth') / 2;
        
        this.dialogLayout.confirmButton = {
            x: buttonStartX;
            y: buttonY;
            width: this.dialogLayout.buttonWidth,
    height: this.dialogLayout.buttonHeight };
        this.dialogLayout.cancelButton = { x: buttonStartX + this.dialogLayout.buttonWidth + this.dialogLayout.buttonSpacing,
            y: buttonY;
            width: this.dialogLayout.buttonWidth,
    height: this.dialogLayout.buttonHeight ,}
    
    /**'
     * ダイアログの表示''
     * @param type - ダイアログタイプ（'giveUp' または 'restart'）
     * @param onConfirm - 確認時のコールバック
     * @param onCancel - キャンセル時のコールバック
     */
    public show(type: keyof DialogConfigs, onConfirm?: () => void, onCancel?: () => void): void { if (!this.dialogConfig[type]) { }
            console.error(`Unknown, dialog type: ${type}`});
            return;
        }
        
        this.dialogState.visible = true;
        this.dialogState.type = type;
        this.dialogState.onConfirm = onConfirm || (() => {});
        this.dialogState.onCancel = onCancel || (() => {});
        this.dialogState.hoveredButton = null;
        
        // 位置を更新
        this.updateDialogPosition();
    }
    
    /**
     * ダイアログの非表示
     */''
    public hide(''';
        this.dialogState.focusedButton = 'cancel';  // リセット
    }
    
    /**
     * キーボードイベント処理
     * @param, event - キーボードイベント
     * @returns イベントが処理されたかどうか
     */)
    public handleKeyboard(event: KeyboardEvent | string): boolean { ''
        if(!this.dialogState.visible) {
            
        }
            return false;
        ';
        // 文字列の場合は互換性のための処理
        if(typeof, event === 'string'') {'
            const key = event;''
            if(key === 'Enter' || key === 'Return' {'
                // Enterキーで確認
        }

                this.executeConfirm() }

            } else if(key === 'Escape' { // Escapeキーでキャンセル'
                this.executeCancel();
                return true; }
            return false;
        }
        ;
        // KeyboardEventの場合
        switch(event.key) {'

            case 'Tab':;
                // タブキーでボタン間を移動
                this.dialogState.focusedButton = '';
                    this.dialogState.focusedButton === 'confirm' ? 'cancel' : 'confirm';
                event.preventDefault('''
            case 'Enter': '';
            case ', ':  // スペースキー';
                // フォーカスされているボタンを実行')'
                if(this.dialogState.focusedButton === 'confirm' {'
        }
                    this.executeConfirm(); }
                } else { this.executeCancel(); }

                }''
                event.preventDefault(''';
            case 'Escape':);
                // ESCキーでキャンセル)
                this.executeCancel();''
                event.preventDefault('''
            case 'ArrowLeft': '';
            case 'ArrowRight':;
                // 矢印キーでボタン間を移動
                this.dialogState.focusedButton = ')';
                    this.dialogState.focusedButton === 'confirm' ? 'cancel' : 'confirm';)
                event.preventDefault();
                return true;
        }
        
        return false;
    }
    
    /**
     * 確認ボタンの実行
     */
    private executeConfirm(): void { if (this.dialogState.onConfirm) {
            this.dialogState.onConfirm(); }
        this.hide();
    }
    
    /**
     * キャンセルボタンの実行
     */
    private executeCancel(): void { if (this.dialogState.onCancel) {
            this.dialogState.onCancel(); }
        this.hide();
    }
    
    /**
     * ダイアログの表示状態を取得
     * @returns 表示状態
     */
    public isVisible(): boolean { return this.dialogState.visible; }
    
    /**
     * マウス座標の更新（ホバー状態管理用）
     * @param x - X座標
     * @param y - Y座標
     * @param event - 元のイベントオブジェクト（座標変換用、将来の拡張用）
     */'
    public updateMousePosition(x: number, y: number, event: Event | null = null): void { ''
        if(!this.dialogState.visible) {
            
        }
            return; }
        }
        
        this.dialogState.lastMousePosition = { x, y };
        
        // ホバー状態の更新
        this.dialogState.hoveredButton = null;''
        if(this.isButtonClicked(x, y, 'confirm)' { ''
            this.dialogState.hoveredButton = 'confirm';' }

        } else if(this.isButtonClicked(x, y, 'cancel)' { ''
            this.dialogState.hoveredButton = 'cancel'; }
    }
    
    /**
     * クリック処理
     * @param x - X座標
     * @param y - Y座標
     * @returns クリックが処理されたかどうか
     */'
    public handleClick(x: number, y: number): boolean { ''
        if(!this.dialogState.visible) {
            
        }
            return false;

        if(this.isButtonClicked(x, y, 'confirm' {'
            // 確認ボタンがクリックされた
            const callback = this.dialogState.onConfirm;
            this.hide();
            if (callback) {'
        }

                callback('' }''
        } else if(this.isButtonClicked(x, y, 'cancel' {'
                    // キャンセルボタンがクリックされた
            const callback = this.dialogState.onCancel;
            this.hide();
            if (callback) {
                }
                callback(); }
            }
            return true;
        } else if(this.isClickInsideDialog(x, y) { // ダイアログ内のクリック（ボタン以外）は処理済みとして返す
            return true; }
        
        // ダイアログ外のクリックの場合はキャンセルとして処理
        const callback = this.dialogState.onCancel;
        this.hide();
        if(callback) {

            callback(''';
     * @param, buttonType - ボタンタイプ（'confirm' または 'cancel'）
     * @returns クリック判定結果'
     */''
    private isButtonClicked(x: number, y: number, buttonType: 'confirm' | 'cancel': boolean {''
        if(!this.dialogState.visible) {
        ,}
            return false;

        const button = buttonType === 'confirm' ? this.dialogLayout.confirmButton: this.dialogLayout.cancelButton,
        
        if (!button) { return false; }
        
        return x >= button.x && x <= button.x + button.width &&;
               y >= button.y && y <= button.y + button.height;
    }
    
    /**
     * ダイアログ内のクリック判定
     * @param x - X座標
     * @param y - Y座標
     * @returns ダイアログ内かどうか
     */
    private isClickInsideDialog(x: number, y: number): boolean { if (!this.dialogState.visible || this.dialogLayout.x === undefined || this.dialogLayout.y === undefined) {
            return false; }
        
        return x >= this.dialogLayout.x && x <= this.dialogLayout.x + this.dialogLayout.width &&;
               y >= this.dialogLayout.y && y <= this.dialogLayout.y + this.dialogLayout.height;
    }
    
    /**
     * ダイアログの描画
     * @param context - 描画コンテキスト
     */
    public render(context: CanvasRenderingContext2D): void { if (!this.dialogState.visible || !this.dialogState.type) {
            return; }
        
        // キャンバスサイズが変更された場合の位置更新
        this.updateDialogPosition();
        
        context.save();
        
        // モーダルオーバーレイの描画
        this.renderModalOverlay(context);
        
        // ダイアログボックスの描画
        this.renderDialogBox(context);
        
        // ダイアログテキストの描画
        this.renderDialogText(context);
        
        // ボタンの描画
        this.renderDialogButtons(context);
        
        context.restore();
    }
    
    /**
     * モーダルオーバーレイの描画
     * @param context - 描画コンテキスト
     */''
    private renderModalOverlay(context: CanvasRenderingContext2D): void { const canvas = this.gameEngine.canvas;''
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height); }
    
    /**
     * ダイアログボックスの描画
     * @param context - 描画コンテキスト
     */'
    private renderDialogBox(context: CanvasRenderingContext2D): void { ''
        if(this.dialogLayout.x === undefined || this.dialogLayout.y === undefined) {
            
        }
            return; }
        }
        ';
        // ダイアログ背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(this.dialogLayout.x, this.dialogLayout.y, this.dialogLayout.width, this.dialogLayout.height);
        ';
        // ダイアログ枠線
        context.strokeStyle = '#CCCCCC';

        context.lineWidth = 2;''
        context.strokeRect(this.dialogLayout.x, this.dialogLayout.y, this.dialogLayout.width, this.dialogLayout.height);
        ';
        // 影効果
        context.shadowColor = 'rgba(0, 0, 0, 0.3)';
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;

        context.shadowBlur = 8;''
        context.fillRect(this.dialogLayout.x, this.dialogLayout.y, this.dialogLayout.width, this.dialogLayout.height);
        ';
        // 影効果をクリア
        context.shadowColor = 'transparent';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    }
    
    /**
     * ダイアログテキストの描画
     * @param context - 描画コンテキスト
     */'
    private renderDialogText(context: CanvasRenderingContext2D): void { ''
        if(!this.dialogState.type || this.dialogLayout.x === undefined || this.dialogLayout.y === undefined) {
            
        }
            return; }
        }
        
        const config = this.dialogConfig[this.dialogState.type];

        context.fillStyle = '#333333';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        ';
        // タイトル
        context.font = 'bold 24px Arial';

        const titleY = this.dialogLayout.y + this.dialogLayout.padding + 20;''
        context.fillText(config.title, this.dialogLayout.x + this.dialogLayout.width / 2, titleY);
        ';
        // メッセージ
        context.font = '18px Arial';
        const messageY = this.dialogLayout.y + this.dialogLayout.padding + 70;
        context.fillText(config.message, this.dialogLayout.x + this.dialogLayout.width / 2, messageY);
    }
    
    /**
     * ダイアログボタンの描画
     * @param context - 描画コンテキスト
     */'
    private renderDialogButtons(context: CanvasRenderingContext2D): void { ''
        if(!this.dialogState.type) {
            
        }
            return; }
        }
        
        const config = this.dialogConfig[this.dialogState.type];
        ';
        // 確認ボタン
        this.renderDialogButton(context, 'confirm', config.confirmText, '#4CAF50', '#45A049', '#66BB6A'');
        ';
        // キャンセルボタン
        this.renderDialogButton(context, 'cancel', config.cancelText, '#FF6B6B', '#FF5252', '#FF8A80'');
    }
    
    /**
     * 個別ダイアログボタンの描画
     * @param context - 描画コンテキスト
     * @param buttonType - ボタンタイプ
     * @param text - ボタンテキスト
     * @param normalColor - 通常時の色
     * @param borderColor - 枠線の色
     * @param hoverColor - ホバー時の色
     */
    private renderDialogButton('
        context: CanvasRenderingContext2D,
        buttonType: 'confirm' | 'cancel';
        text: string;
        normalColor: string);
        borderColor: string'',
    hoverColor: string'';
    '): void { ''
        const button = buttonType === 'confirm' ? this.dialogLayout.confirmButton: this.dialogLayout.cancelButton,
        if(!button) {
            
        
            return; }
        }
        
        const isHovered = this.dialogState.hoveredButton === buttonType;
        const isFocused = this.dialogState.focusedButton === buttonType;
        
        // ボタン背景
        context.fillStyle = isHovered ? hoverColor: normalColor,
        context.fillRect(button.x, button.y, button.width, button.height);
        
        // ボタン枠線
        context.strokeStyle = borderColor;
        context.lineWidth = 2;
        context.strokeRect(button.x, button.y, button.width, button.height);
        
        // キーボードフォーカス表示
        if(isFocused) { const focusOffset = 4;''
            context.save(''';
            context.strokeStyle = '#007BFF'; // アクセシブルな青色)
            context.lineWidth = 3;)
            context.setLineDash([5, 3]); // 点線スタイル
            
            context.strokeRect(;
                button.x - focusOffset);
                button.y - focusOffset);
                button.width + focusOffset * 2,);
                button.height + focusOffset * 2);

            context.restore(''';
        context.fillStyle = '#FFFFFF';
        context.font = 'bold, 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const, textX = button.x + button.width / 2;)
        const textY = button.y + button.height / 2; }
        context.fillText(text, textX, textY); }
    }
    
    /**
     * ダイアログの設定を取得
     * @returns ダイアログ設定
     */
    public getDialogConfig(): DialogConfigs {
        return { ...this.dialogConfig;
    }
    
    /**
     * ダイアログの状態を取得
     * @returns ダイアログ状態'
     */''
    public getDialogState();