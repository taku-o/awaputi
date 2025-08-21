/**
 * ダイアログのベースクラス
 * 個別のダイアログコンポーネントの基底クラス
 */

// Type definitions for dialog components
export interface DialogButton { text: string,
    callback: () => void,
    color?: string,
    disabled?: boolean,
    action?: () => void,  }
}

export interface DialogLayout { x: number,
    y: number,
    width: number,
    height: number,
    padding: number,
    titleHeight: number,
    buttonHeight: number,
    buttonSpacing: number,
    borderColor?: string,
    backgroundColor?: string,
    fontSize?: number,  }

export interface DialogData { title?: string,
    [key: string]: unknown }

export interface DialogResult { action: 'ok' | 'cancel' | string,
    data: unknown  }

export interface AccessibilitySettings { highContrast?: boolean,
    largeText?: boolean,
    reducedMotion?: boolean }

export interface GameEngine { errorHandler?: {
        error: (message: string, error: Error) => void  }
    };
    canvas?: HTMLCanvasElement;
    playerData?: unknown;
    gameSettings?: unknown;
    achievementManager?: unknown;
}

export interface EventBus { emit: (event: string, data?: unknown) => void,
    on: (event: string, callback: (dat,a?: unknown) => void) => void  }
}

export interface GameState { accessibilitySettings?: AccessibilitySettings,
    showingDialog?: string | null,
    dialogData?: DialogData,
    onChange?: (key: string, callback: (valu,e: unknown) => void) => void,
    set?: (key: string, value: unknown, notify?: boolean) => void 
    }

/**
 * シーン用ダイアログ基底クラス
 * ゲーム内でのダイアログ機能を統一管理
 */
export class ScenesBaseDialog {
    protected gameEngine: GameEngine,
    protected eventBus: EventBus,
    protected state: GameState,
    // ダイアログの基本設定
    protected dialogData: DialogData,
    protected buttons: DialogButton[],
    protected selectedButton: number,
    protected isVisible: boolean,
    protected isInitialized: boolean,
    
    // レイアウト設定
    protected layout: DialogLayout,
    // イベントリスナー
    public onResult: ((result: DialogResult) => void) | null,
    public onError: ((error: Error) => void) | null,
    
    // エラーハンドラー  }
    protected errorHandler: { error: (message: string, error: Error) => void  }
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: GameState) {
        this.gameEngine = gameEngine,
        this.eventBus = eventBus,
        this.state = state }
        // ダイアログの基本設定 }
        this.dialogData = {};
        this.buttons = [];
        this.selectedButton = 0;
        this.isVisible = false;
        this.isInitialized = false;
        
        // レイアウト設定
        this.layout = { x: 0, y: 0, width: 400, height: 300,
            padding: 20,
            titleHeight: 40,
            buttonHeight: 35,
    buttonSpacing: 10  };
        // イベントリスナー
        this.onResult = null;
        this.onError = null;
        
        // エラーハンドラー
        this.errorHandler = this.gameEngine?.errorHandler || console;
    }
    
    /**
     * ダイアログを初期化
     * @param options - 初期化オプション
     */ : undefined
    async initialize(options: DialogData = { ): Promise<void> { 
        this.dialogData = { ...options,
        this.isInitialized = true,
        return Promise.resolve() }
    
    /**
     * ダイアログデータを取得
     * @returns ダイアログデータ
     */
    getData(): DialogData { return this.dialogData }
    
    /**
     * ダイアログデータを設定
     * @param data - 設定するデータ
     */
    setData(data: DialogData): this {
        this.dialogData = { ...this.dialogData, ...data,
        return this }
    
    /**
     * ダイアログをレンダリング
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     */
    render(context: CanvasRenderingContext2D, layout: Partial<DialogLayout> | null = null): void { ''
        if(!this.isInitialized) {

            console.warn('Dialog, not initialized) }
            return; }
        }
        
        try {
            this.layout = { ...this.layout ...layout,
            
            // ダイアログ背景
            this.renderBackground(context),
            
            // タイトルをレンダリング
            this.renderTitle(context),
            
            // コンテンツをレンダリング
            this.renderContent(context),
            
            // ボタンをレンダリング
            this.renderButtons(context) } catch (error) { this.renderError(context error as Error') }
    }
    
    /**
     * タイトルをレンダリング
     * @param context - Canvas描画コンテキスト
     */
    protected renderTitle(context: CanvasRenderingContext2D'): void { ''
        if(!this.dialogData.title) return,

        context.fillStyle = '#333333',
        context.font = 'bold 18px Arial, sans-serif',
        context.textAlign = 'center',
        context.textBaseline = 'middle',
        context.fillText(
            this.dialogData.title, as string),
            this.layout.x + this.layout.width / 2),
            this.layout.y + this.layout.titleHeight / 2) }
    
    /**
     * コンテンツをレンダリング（オーバーライド用）
     * @param context - Canvas描画コンテキスト
     */
    protected renderContent(context: CanvasRenderingContext2D): void { // サブクラスでオーバーライド }
    
    /**
     * エラー表示をレンダリング
     * @param context - Canvas描画コンテキスト
     * @param error - エラーオブジェクト
     */''
    protected renderError(context: CanvasRenderingContext2D, error: Error): void { ''
        context.fillStyle = '#FF0000',
        context.font = '14px Arial, sans-serif',
        context.textAlign = 'center',
        context.textBaseline = 'middle',

        context.fillText()',
            'ダイアログの表示でエラーが発生しました'),
            this.layout.x + this.layout.width / 2,',
            this.layout.y + this.layout.height / 2'',
        '),
        console.error('Dialog render error:', error }
    
    /**
     * ボタンをレンダリング
     * @param context - Canvas描画コンテキスト
     */
    protected renderButtons(context: CanvasRenderingContext2D): void { if (!this.buttons || this.buttons.length === 0) {
            return }
        
        const buttonY = this.layout.y + this.layout.height - this.layout.padding - this.layout.buttonHeight;
        const totalButtonWidth = this.buttons.length * 100 + (this.buttons.length - 1) * this.layout.buttonSpacing;
        const startX = this.layout.x + (this.layout.width - totalButtonWidth) / 2;
        
        this.buttons.forEach((button, index) => {  const buttonX = startX + index * (100 + this.layout.buttonSpacing) }
            this.renderButton(context, buttonX, buttonY, 100, this.layout.buttonHeight, button, index === this.selectedButton); }
        });
    }
    
    /**
     * 個別ボタンをレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     * @param button - ボタン情報
     * @param isSelected - 選択状態
     */
    protected renderButton(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number, ;
        width: number, ;
        height: number );
        button: DialogButton)',
    isSelected: boolean';
    '): void { // ボタン背景'
        context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC',
        this.roundRect(context, x, y, width, height, 5),
        context.fill('''
        context.strokeStyle = isSelected ? '#45A049' : '#999999')
        context.lineWidth = 1,
        this.roundRect(context, x, y, width, height, 5),
        context.stroke('''
        context.fillStyle = isSelected ? '#FFFFFF' : '#333333',
        context.font = '14px Arial, sans-serif',
        context.textAlign = 'center',
        context.textBaseline = 'middle',

        context.fillText()',
            button.text || 'ボタン'),
            x + width / 2),
            y + height / 2) }
    
    /**
     * クリック処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @param layout - レイアウト情報
     * @returns 処理されたかどうか
     */
    handleClick(x: number, y: number, layout: Partial<DialogLayout> | null = null): boolean { if (layout) { }
            this.layout = { ...this.layout, ...layout }
        
        // ボタンクリック判定
        const buttonIndex = this.getClickedButtonIndex(x, y);
        if(buttonIndex !== -1) {
            this.handleButtonClick(buttonIndex) }
            return true;
        
        // コンテンツエリアクリック
        return this.handleContentClick(x, y);
    }
    
    /**
     * キーボード処理
     * @param event - キーボードイベント
     * @returns 処理されたかどうか
     */
    handleKeyboard(event: KeyboardEvent): boolean { ''
        switch(event.key) {

            case 'ArrowLeft':',
                if(this.selectedButton > 0) {
                    this.selectedButton-- }
                    return true;

                break;
            case 'ArrowRight':';
                if(this.selectedButton < this.buttons.length - 1) {
                    this.selectedButton++ }
                    return true;

                break;
            case 'Enter':';
            case ', ':';
                this.handleButtonClick(this.selectedButton);

                return true;
            case 'Escape':
                this.handleCancel();
                return true;
            default: return this.handleContentKeyboard(event);
        }
        return false;
    }
    
    /**
     * ボタンクリック処理
     * @param index - ボタンインデックス
     */
    protected handleButtonClick(index: number): void { const button = this.buttons[index],
        if(button && button.callback) {
    
}
            button.callback(); }
}
    
    /**
     * コンテンツクリック処理（オーバーライド用）
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @returns 処理されたかどうか
     */
    protected handleContentClick(x: number, y: number): boolean { return false }
    
    /**
     * コンテンツキーボード処理（オーバーライド用）
     * @param event - キーボードイベント
     * @returns 処理されたかどうか
     */
    protected handleContentKeyboard(event: KeyboardEvent): boolean { return false }
    
    /**
     * ボタン設定
     * @param buttons - ボタン配列
     */
    setupButtons(buttons?: DialogButton[]): void { this.buttons = buttons || [],
        this.selectedButton = 0,
        ',
        // デフォルトボタンの設定
        if(this.buttons.length === 0) {
            this.buttons = [' }

                { text: 'OK', callback: () => this.handleOK()  }]'
                { text: 'キャンセル', callback: () => this.handleCancel()  }]
            ];
        }
    }
    
    /**
     * OK処理
     */'
    protected handleOK(): void { ''
        if(this.onResult) {', ' }

            this.onResult({ action: 'ok', data: this.dialogData  }
    }
    
    /**
     * キャンセル処理
     */'
    protected handleCancel(): void { ''
        if(this.onResult) {', ' }

            this.onResult({ action: 'cancel', data: null  }
    }
    
    /**
     * クリックされたボタンのインデックスを取得
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @returns ボタンインデックス（-1: なし）
     */
    protected getClickedButtonIndex(x: number, y: number): number { if (!this.buttons || this.buttons.length === 0) {
            return -1 }
        
        const buttonY = this.layout.y + this.layout.height - this.layout.padding - this.layout.buttonHeight;
        const totalButtonWidth = this.buttons.length * 100 + (this.buttons.length - 1) * this.layout.buttonSpacing;
        const startX = this.layout.x + (this.layout.width - totalButtonWidth) / 2;
        
        for(let, i = 0; i < this.buttons.length; i++) {
        
            const buttonX = startX + i * (100 + this.layout.buttonSpacing),
            if (x >= buttonX && x <= buttonX + 100 && ,
                y >= buttonY && y <= buttonY + this.layout.buttonHeight) {
    
}
                return i;
        
        return -1;
    }
    
    /**
     * テキストの折り返し処理
     * @param context - Canvas描画コンテキスト
     * @param text - 折り返すテキスト
     * @param maxWidth - 最大幅
     * @returns 行配列'
     */''
    protected wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] { ''
        const words = text.split(', '),
        const lines: string[] = [],

        let currentLine = words[0],

        for(let, i = 1, i < words.length, i++) {
            const word = words[i],
            const width = context.measureText(currentLine + ', ' + word'.width,
            if(width < maxWidth) {
        }

                currentLine += ', ' + word; }
            } else {  lines.push(currentLine) }
                currentLine = word; }
}
        lines.push(currentLine);
        return lines;
    }
    
    /**
     * 角丸矩形を描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     * @param radius - 角の半径
     */
    protected roundRect(;
        context: CanvasRenderingContext2D,
    x: number, ;
        y: number, ;
        width: number );
        height: number,
    radius: number;
    ): void { context.beginPath(
        context.moveTo(x + radius, y),
        context.lineTo(x + width - radius, y),
        context.quadraticCurveTo(x + width, y, x + width, y + radius),
        context.lineTo(x + width, y + height - radius),
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height),
        context.lineTo(x + radius, y + height),
        context.quadraticCurveTo(x, y + height, x, y + height - radius),
        context.lineTo(x, y + radius),
        context.quadraticCurveTo(x, y, x + radius, y),
        context.closePath() }
    
    /**
     * 色を明るくする
     * @param color - 元の色
     * @param percent - 明るくする割合（0-1）
     * @returns 明るくされた色
     */
    protected lightenColor(color: string, percent: number): string { const r = parseInt(color.slice(1, 3), 16),
        const g = parseInt(color.slice(3, 5), 16),
        const b = parseInt(color.slice(5, 7), 16),

        const newR = Math.min(255, Math.floor(r + (255 - r) * percent)),

        const newG = Math.min(255, Math.floor(g + (255 - g) * percent)),
        const newB = Math.min(255, Math.floor(b + (255 - b) * percent)'),

        return '#' + ',
            newR.toString(16).padStart(2, '0' +',
            newG.toString(16).padStart(2, '0' +',
            newB.toString(16).padStart(2, '0' }'
    
    /**
     * アクセシビリティ設定を適用
     * @param settings - アクセシビリティ設定
     */'
    applyAccessibilitySettings(settings: AccessibilitySettings): void { ''
        if(settings.highContrast) {
            // ハイコントラスト設定の適用
            this.layout.borderColor = '#000000' }

            this.layout.backgroundColor = '#FFFFFF'; }
        }
        
        if(settings.largeText) {
        
            // 大きなテキスト設定の適用
        
        }
            this.layout.fontSize = Math.floor((this.layout.fontSize || 14) * 1.2); }
}
    
    /**
     * レンダリング背景処理
     * @param context - Canvas描画コンテキスト
     */''
    protected renderBackground(context: CanvasRenderingContext2D): void { // 背景オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.5)',
        context.fillRect(0, 0, context.canvas.width, context.canvas.height),
        ',
        // ダイアログ背景
        context.fillStyle = '#F8F9FA',

        this.roundRect(context, this.layout.x, this.layout.y, this.layout.width, this.layout.height, 8),
        context.fill('',
        context.strokeStyle = '#DEE2E6')
        context.lineWidth = 1)
        this.roundRect(context, this.layout.x, this.layout.y, this.layout.width, this.layout.height, 8),
        context.stroke() }
    
    /**
     * レンダリングエラー処理
     * @param operation - 操作名
     * @param error - エラーオブジェクト
     */
    protected handleRenderError(operation: string, error: Error): void { console.error(`ScenesBaseDialog ${operation) error:`, error),
        ',
        // エラーイベントを発火
        if(this.eventBus) {

            this.eventBus.emit('component-error', {}'
                component: 'ScenesBaseDialog'
    }

                operation,') }'

                error'}';
        }
        ';
        // 重大なエラーの場合はダイアログを強制終了
        if(operation === 'render' {'
            this.isVisible = false,
            if (this.onError) {
        }
                this.onError(error); }
}
    }
    
    /**
     * クリーンアップ'
     */''
    cleanup();