/**
 * ダイアログのベースクラス
 * 個別のダイアログコンポーネントの基底クラス
 */
/**
 * シーン用ダイアログ基底クラス
 * ゲーム内でのダイアログ機能を統一管理
 */
export class ScenesBaseDialog {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // ダイアログの基本設定
        this.dialogData = {};
        this.buttons = [];
        this.selectedButton = 0;
        this.isVisible = false;
        this.isInitialized = false;
        
        // レイアウト設定
        this.layout = {
            x: 0, y: 0, width: 400, height: 300,
            padding: 20,
            titleHeight: 40,
            buttonHeight: 35,
            buttonSpacing: 10
        };
        
        // イベントリスナー
        this.onResult = null;
        this.onError = null;
        
        // エラーハンドラー
        this.errorHandler = this.gameEngine?.errorHandler || console;
    }
    
    /**
     * ダイアログを初期化
     * @param {Object} options - 初期化オプション
     */
    async initialize(options = {}) {
        this.dialogData = { ...options };
        this.isInitialized = true;
        return Promise.resolve();
    }
    
    /**
     * ダイアログデータを取得
     * @returns {Object} ダイアログデータ
     */
    getData() {
        return this.dialogData;
    }
    
    /**
     * ダイアログデータを設定
     * @param {Object} data - 設定するデータ
     */
    setData(data) {
        this.dialogData = { ...this.dialogData, ...data };
        return this;
    }
    
    /**
     * ダイアログをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    render(context, layout = null) {
        if (!this.isInitialized) {
            console.warn('Dialog not initialized');
            return;
        }
        
        try {
            this.layout = { ...this.layout, ...layout };
            
            // ダイアログ背景
            this.renderBackground(context);
            
            // タイトルをレンダリング
            this.renderTitle(context);
            
            // コンテンツをレンダリング
            this.renderContent(context);
            
            // ボタンをレンダリング
            this.renderButtons(context);
            
        } catch (error) {
            this.renderError(context, error);
        }
    }
    
    /**
     * タイトルをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderTitle(context) {
        if (!this.dialogData.title) return;
        
        context.fillStyle = '#333333';
        context.font = 'bold 18px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            this.dialogData.title,
            this.layout.x + this.layout.width / 2,
            this.layout.y + this.layout.titleHeight / 2
        );
    }
    
    /**
     * コンテンツをレンダリング（オーバーライド用）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderContent(context) {
        // サブクラスでオーバーライド
    }
    
    /**
     * エラー表示をレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Error} error - エラーオブジェクト
     */
    renderError(context, error) {
        context.fillStyle = '#FF0000';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            'ダイアログの表示でエラーが発生しました',
            this.layout.x + this.layout.width / 2,
            this.layout.y + this.layout.height / 2
        );
        console.error('Dialog render error:', error);
    }
    
    /**
     * ボタンをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderButtons(context) {
        if (!this.buttons || this.buttons.length === 0) {
            return;
        }
        
        const buttonY = this.layout.y + this.layout.height - this.layout.padding - this.layout.buttonHeight;
        const totalButtonWidth = this.buttons.length * 100 + (this.buttons.length - 1) * this.layout.buttonSpacing;
        const startX = this.layout.x + (this.layout.width - totalButtonWidth) / 2;
        
        this.buttons.forEach((button, index) => {
            const buttonX = startX + index * (100 + this.layout.buttonSpacing);
            this.renderButton(context, buttonX, buttonY, 100, this.layout.buttonHeight, button, index === this.selectedButton);
        });
    }
    
    /**
     * 個別ボタンをレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {Object} button - ボタン情報
     * @param {boolean} isSelected - 選択状態
     */
    renderButton(context, x, y, width, height, button, isSelected) {
        // ボタン背景
        context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC';
        this.roundRect(context, x, y, width, height, 5);
        context.fill();
        
        // ボタン枠線
        context.strokeStyle = isSelected ? '#45A049' : '#999999';
        context.lineWidth = 1;
        this.roundRect(context, x, y, width, height, 5);
        context.stroke();
        
        // ボタンテキスト
        context.fillStyle = isSelected ? '#FFFFFF' : '#333333';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            button.text || 'ボタン',
            x + width / 2,
            y + height / 2
        );
    }
    
    /**
     * クリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} 処理されたかどうか
     */
    handleClick(x, y, layout = null) {
        if (layout) {
            this.layout = { ...this.layout, ...layout };
        }
        
        // ボタンクリック判定
        const buttonIndex = this.getClickedButtonIndex(x, y);
        if (buttonIndex !== -1) {
            this.handleButtonClick(buttonIndex);
            return true;
        }
        
        // コンテンツエリアクリック
        return this.handleContentClick(x, y);
    }
    
    /**
     * キーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} 処理されたかどうか
     */
    handleKeyboard(event) {
        switch (event.key) {
            case 'ArrowLeft':
                if (this.selectedButton > 0) {
                    this.selectedButton--;
                    return true;
                }
                break;
            case 'ArrowRight':
                if (this.selectedButton < this.buttons.length - 1) {
                    this.selectedButton++;
                    return true;
                }
                break;
            case 'Enter':
            case ' ':
                this.handleButtonClick(this.selectedButton);
                return true;
            case 'Escape':
                this.handleCancel();
                return true;
            default:
                return this.handleContentKeyboard(event);
        }
        return false;
    }
    
    /**
     * ボタンクリック処理
     * @param {number} index - ボタンインデックス
     */
    handleButtonClick(index) {
        const button = this.buttons[index];
        if (button && button.callback) {
            button.callback();
        }
    }
    
    /**
     * コンテンツクリック処理（オーバーライド用）
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {boolean} 処理されたかどうか
     */
    handleContentClick(x, y) {
        return false;
    }
    
    /**
     * コンテンツキーボード処理（オーバーライド用）
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} 処理されたかどうか
     */
    handleContentKeyboard(event) {
        return false;
    }
    
    /**
     * ボタン設定
     * @param {Array} buttons - ボタン配列
     */
    setupButtons(buttons) {
        this.buttons = buttons || [];
        this.selectedButton = 0;
        
        // デフォルトボタンの設定
        if (this.buttons.length === 0) {
            this.buttons = [
                { text: 'OK', callback: () => this.handleOK() },
                { text: 'キャンセル', callback: () => this.handleCancel() }
            ];
        }
    }
    
    /**
     * OK処理
     */
    handleOK() {
        if (this.onResult) {
            this.onResult({ action: 'ok', data: this.dialogData });
        }
    }
    
    /**
     * キャンセル処理
     */
    handleCancel() {
        if (this.onResult) {
            this.onResult({ action: 'cancel', data: null });
        }
    }
    
    /**
     * クリックされたボタンのインデックスを取得
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {number} ボタンインデックス（-1: なし）
     */
    getClickedButtonIndex(x, y) {
        if (!this.buttons || this.buttons.length === 0) {
            return -1;
        }
        
        const buttonY = this.layout.y + this.layout.height - this.layout.padding - this.layout.buttonHeight;
        const totalButtonWidth = this.buttons.length * 100 + (this.buttons.length - 1) * this.layout.buttonSpacing;
        const startX = this.layout.x + (this.layout.width - totalButtonWidth) / 2;
        
        for (let i = 0; i < this.buttons.length; i++) {
            const buttonX = startX + i * (100 + this.layout.buttonSpacing);
            if (x >= buttonX && x <= buttonX + 100 && 
                y >= buttonY && y <= buttonY + this.layout.buttonHeight) {
                return i;
            }
        }
        
        return -1;
    }
    
    /**
     * テキストの折り返し処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {string} text - 折り返すテキスト
     * @param {number} maxWidth - 最大幅
     * @returns {Array} 行配列
     */
    wrapText(context, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    /**
     * 角丸矩形を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {number} radius - 角の半径
     */
    roundRect(context, x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
    }
    
    /**
     * 色を明るくする
     * @param {string} color - 元の色
     * @param {number} percent - 明るくする割合（0-1）
     * @returns {string} 明るくされた色
     */
    lightenColor(color, percent) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const newR = Math.min(255, Math.floor(r + (255 - r) * percent));
        const newG = Math.min(255, Math.floor(g + (255 - g) * percent));
        const newB = Math.min(255, Math.floor(b + (255 - b) * percent));
        
        return '#' + 
            newR.toString(16).padStart(2, '0') +
            newG.toString(16).padStart(2, '0') +
            newB.toString(16).padStart(2, '0');
    }
    
    /**
     * アクセシビリティ設定を適用
     * @param {Object} settings - アクセシビリティ設定
     */
    applyAccessibilitySettings(settings) {
        if (settings.highContrast) {
            // ハイコントラスト設定の適用
            this.layout.borderColor = '#000000';
            this.layout.backgroundColor = '#FFFFFF';
        }
        
        if (settings.largeText) {
            // 大きなテキスト設定の適用
            this.layout.fontSize = Math.floor(this.layout.fontSize * 1.2);
        }
    }
    
    /**
     * レンダリング背景処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderBackground(context) {
        // 背景オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // ダイアログ背景
        context.fillStyle = '#F8F9FA';
        this.roundRect(context, this.layout.x, this.layout.y, this.layout.width, this.layout.height, 8);
        context.fill();
        
        // ダイアログ枠線
        context.strokeStyle = '#DEE2E6';
        context.lineWidth = 1;
        this.roundRect(context, this.layout.x, this.layout.y, this.layout.width, this.layout.height, 8);
        context.stroke();
    }
    
    /**
     * レンダリングエラー処理
     * @param {string} operation - 操作名
     * @param {Error} error - エラーオブジェクト
     */
    handleRenderError(operation, error) {
        console.error(`ScenesBaseDialog ${operation} error:`, error);
        
        // エラーイベントを発火
        if (this.eventBus) {
            this.eventBus.emit('component-error', {
                component: 'ScenesBaseDialog',
                operation,
                error
            });
        }
        
        // 重大なエラーの場合はダイアログを強制終了
        if (operation === 'render') {
            this.isVisible = false;
            if (this.onError) {
                this.onError(error);
            }
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.dialogData = {};
        this.buttons = [];
        this.selectedButton = 0;
        this.isVisible = false;
        this.isInitialized = false;
        this.onResult = null;
        this.onError = null;
    }
}