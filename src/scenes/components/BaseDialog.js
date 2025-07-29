/**
 * ダイアログのベースクラス
 * 個別のダイアログコンポーネントの基底クラス
 */
export class BaseDialog {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // ダイアログの基本プロパティ
        this.title = '';
        this.isInitialized = false;
        this.data = {};
        
        // コールバック関数
        this.onResult = null;
        this.onError = null;
        
        // レンダリング設定
        this.textSettings = {
            titleFont: '18px sans-serif',
            contentFont: '14px sans-serif',
            buttonFont: '14px sans-serif',
            titleColor: '#333333',
            contentColor: '#666666',
            buttonTextColor: '#FFFFFF',
            errorColor: '#DC3545'
        };
        
        // ボタン設定
        this.buttons = [];
        this.focusedButton = 0;
        
        // アクセシビリティ設定を適用
        this.applyAccessibilitySettings();
    }
    
    /**
     * ダイアログの初期化
     * @param {Object} options - 初期化オプション
     */
    async initialize(options = {}) {
        this.data = { ...options };
        this.setupButtons();
        this.isInitialized = true;
    }
    
    /**
     * ダイアログのデータを取得
     * @returns {Object} - ダイアログデータ
     */
    getData() {
        return this.data;
    }
    
    /**
     * ダイアログのデータを設定
     * @param {string} key - キー
     * @param {*} value - 値
     */
    setData(key, value) {
        this.data[key] = value;
        this.state.set('dialogData', this.data);
    }
    
    /**
     * ダイアログレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    render(context, layout) {
        try {
            // タイトルを描画
            this.renderTitle(context, layout);
            
            // コンテンツを描画
            this.renderContent(context, layout);
            
            // エラーメッセージを描画
            this.renderError(context, layout);
            
            // ボタンを描画
            this.renderButtons(context, layout);
        } catch (error) {
            this.handleRenderError(error, context, layout);
        }
    }
    
    /**
     * タイトルを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderTitle(context, layout) {
        if (!this.title) return;
        
        context.font = this.textSettings.titleFont;
        context.fillStyle = this.textSettings.titleColor;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        const titleY = layout.contentY + 10;
        context.fillText(this.title, layout.x + layout.width / 2, titleY);
    }
    
    /**
     * コンテンツを描画（子クラスでオーバーライド）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderContent(context, layout) {
        // 子クラスで実装
    }
    
    /**
     * エラーメッセージを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderError(context, layout) {
        if (!this.data.error) return;
        
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.errorColor;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        
        const errorY = layout.buttonY - 30;
        this.wrapText(context, this.data.error, layout.x + layout.width / 2, errorY, layout.contentWidth);
    }
    
    /**
     * ボタンを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderButtons(context, layout) {
        if (this.buttons.length === 0) return;
        
        const buttonCount = this.buttons.length;
        const totalButtonWidth = buttonCount * layout.buttonWidth + (buttonCount - 1) * 10;
        const startX = layout.x + (layout.width - totalButtonWidth) / 2;
        
        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.buttons[i];
            const buttonX = startX + i * (layout.buttonWidth + 10);
            const buttonY = layout.buttonY;
            
            this.renderButton(context, button, buttonX, buttonY, layout.buttonWidth, layout.buttonHeight, i === this.focusedButton);
        }
    }
    
    /**
     * 個別ボタンを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} button - ボタン情報
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {boolean} focused - フォーカス状態
     */
    renderButton(context, button, x, y, width, height, focused) {
        const cornerRadius = 4;
        
        // ボタンの背景色を決定
        let backgroundColor = button.color || '#007BFF';
        if (button.disabled) {
            backgroundColor = '#6C757D';
        } else if (focused) {
            backgroundColor = this.lightenColor(backgroundColor, 0.1);
        }
        
        // ボタン背景を描画
        context.fillStyle = backgroundColor;
        this.roundRect(context, x, y, width, height, cornerRadius);
        context.fill();
        
        // フォーカス時の境界線
        if (focused) {
            context.strokeStyle = '#0056B3';
            context.lineWidth = 2;
            this.roundRect(context, x, y, width, height, cornerRadius);
            context.stroke();
        }
        
        // ボタンテキストを描画
        context.font = this.textSettings.buttonFont;
        context.fillStyle = button.disabled ? '#ADB5BD' : this.textSettings.buttonTextColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(button.text, x + width / 2, y + height / 2);
    }
    
    /**
     * クリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleClick(x, y, layout) {
        // ボタンのクリック判定
        const buttonIndex = this.getClickedButtonIndex(x, y, layout);
        if (buttonIndex !== -1 && !this.buttons[buttonIndex].disabled) {
            return this.handleButtonClick(buttonIndex);
        }
        
        // コンテンツエリアのクリック処理
        return this.handleContentClick(x, y, layout);
    }
    
    /**
     * キーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleKeyboard(event) {
        switch (event.key) {
            case 'Enter':
                if (this.buttons.length > 0 && !this.buttons[this.focusedButton].disabled) {
                    return this.handleButtonClick(this.focusedButton);
                }
                break;
                
            case 'Tab':
                event.preventDefault();
                this.focusedButton = (this.focusedButton + 1) % this.buttons.length;
                return true;
                
            case 'ArrowLeft':
                event.preventDefault();
                this.focusedButton = Math.max(0, this.focusedButton - 1);
                return true;
                
            case 'ArrowRight':
                event.preventDefault();
                this.focusedButton = Math.min(this.buttons.length - 1, this.focusedButton + 1);
                return true;
                
            default:
                return this.handleContentKeyboard(event);
        }
        
        return false;
    }
    
    /**
     * ボタンクリック処理（子クラスでオーバーライド）
     * @param {number} buttonIndex - クリックされたボタンのインデックス
     * @returns {boolean} - イベントが処理された場合true
     */
    handleButtonClick(buttonIndex) {
        const button = this.buttons[buttonIndex];
        if (button.action) {
            return button.action();
        }
        return false;
    }
    
    /**
     * コンテンツエリアクリック処理（子クラスでオーバーライド）
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentClick(x, y, layout) {
        return false;
    }
    
    /**
     * コンテンツエリアキーボード処理（子クラスでオーバーライド）
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentKeyboard(event) {
        return false;
    }
    
    /**
     * ボタンの設定（子クラスでオーバーライド）
     */
    setupButtons() {
        this.buttons = [
            {
                text: 'OK',
                color: '#28A745',
                action: () => this.handleOK()
            },
            {
                text: 'キャンセル',
                color: '#6C757D',
                action: () => this.handleCancel()
            }
        ];
    }
    
    /**
     * OKボタン処理
     * @returns {boolean} - 処理成功の場合true
     */
    handleOK() {
        if (this.onResult) {
            this.onResult({ action: 'ok', data: this.data });
        }
        return true;
    }
    
    /**
     * キャンセルボタン処理
     * @returns {boolean} - 処理成功の場合true
     */
    handleCancel() {
        if (this.onResult) {
            this.onResult({ action: 'cancel', data: this.data });
        }
        return true;
    }
    
    /**
     * クリックされたボタンのインデックスを取得
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {number} - ボタンインデックス（-1は該当なし）
     */
    getClickedButtonIndex(x, y, layout) {
        if (this.buttons.length === 0) return -1;
        
        const buttonCount = this.buttons.length;
        const totalButtonWidth = buttonCount * layout.buttonWidth + (buttonCount - 1) * 10;
        const startX = layout.x + (layout.width - totalButtonWidth) / 2;
        
        for (let i = 0; i < this.buttons.length; i++) {
            const buttonX = startX + i * (layout.buttonWidth + 10);
            const buttonY = layout.buttonY;
            
            if (x >= buttonX && x <= buttonX + layout.buttonWidth &&
                y >= buttonY && y <= buttonY + layout.buttonHeight) {
                return i;
            }
        }
        
        return -1;
    }
    
    /**
     * テキストを指定幅で折り返し描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {string} text - 描画するテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} maxWidth - 最大幅
     * @returns {number} - 描画した行数
     */
    wrapText(context, text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let lineHeight = 20;
        let lineCount = 0;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y + lineCount * lineHeight);
                line = words[n] + ' ';
                lineCount++;
            } else {
                line = testLine;
            }
        }
        
        context.fillText(line, x, y + lineCount * lineHeight);
        return lineCount + 1;
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
     * @param {number} amount - 明るくする量(0-1)
     * @returns {string} - 明るくした色
     */
    lightenColor(color, amount) {
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount * 255;
        let g = (num >> 8 & 0x00FF) + amount * 255;
        let b = (num & 0x0000FF) + amount * 255;
        
        r = r > 255 ? 255 : r;
        g = g > 255 ? 255 : g;
        b = b > 255 ? 255 : b;
        
        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }
    
    /**
     * アクセシビリティ設定を適用
     */
    applyAccessibilitySettings() {
        const settings = this.state.accessibilitySettings || {};
        
        if (settings.highContrast) {
            this.textSettings.titleColor = '#000000';
            this.textSettings.contentColor = '#000000';
            this.textSettings.errorColor = '#FF0000';
        }
        
        if (settings.largeText) {
            this.textSettings.titleFont = '22px sans-serif';
            this.textSettings.contentFont = '18px sans-serif';
            this.textSettings.buttonFont = '18px sans-serif';
        }
    }
    
    /**
     * レンダリングエラー処理
     * @param {Error} error - エラーオブジェクト
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    handleRenderError(error, context, layout) {
        console.error('Dialog render error:', error);
        
        // エラーメッセージを表示
        context.fillStyle = '#FF6B6B';
        context.fillRect(layout.contentX, layout.contentY, layout.contentWidth, layout.contentHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            'ダイアログの描画でエラーが発生しました',
            layout.x + layout.width / 2,
            layout.y + layout.height / 2
        );
        
        if (this.onError) {
            this.onError(error);
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.onResult = null;
        this.onError = null;
        this.data = {};
    }
}