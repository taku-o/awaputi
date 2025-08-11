/**
 * ユーザー名変更ダイアログ
 */
import { ScenesBaseDialog } from './ScenesBaseDialog.js';

export class UsernameDialog extends ScenesBaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        this.title = 'ユーザー名の変更';
        this.maxUsernameLength = 10;
        this.inputActive = false;
        this.cursorPosition = 0;
        this.cursorBlinkTimer = 0;
        this.showCursor = true;
        
        // 入力検証設定
        this.validation = {
            allowedChars: /^[a-zA-Z0-9ぁ-んァ-ヶー一-龯\s]*$/,
            prohibitedWords: ['admin', 'test', 'guest', 'null', 'undefined'],
            minLength: 1
        };
    }
    
    /**
     * ダイアログの初期化
     * @param {Object} options - 初期化オプション
     */
    async initialize(options = {}) {
        await super.initialize(options);
        
        // 現在のユーザー名を取得
        const playerData = this.gameEngine.playerData;
        this.data.currentUsername = playerData.getUsername() || '';
        this.data.newUsername = this.data.currentUsername;
        this.data.error = null;
        
        this.cursorPosition = this.data.newUsername.length;
        this.inputActive = true;
    }
    
    /**
     * ボタンの設定
     */
    setupButtons() {
        this.buttons = [
            {
                text: '変更',
                color: '#28A745',
                action: () => this.handleUsernameChange(),
                get disabled() {
                    return !this.isValidUsername();
                }
            },
            {
                text: 'キャンセル',
                color: '#6C757D',
                action: () => this.handleCancel()
            }
        ];
    }
    
    /**
     * コンテンツを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderContent(context, layout) {
        const contentY = layout.contentY + 50;
        
        // 現在のユーザー名を表示
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        context.fillText('現在のユーザー名:', layout.contentX, contentY);
        context.fillText(this.data.currentUsername || '(未設定)', layout.contentX + 120, contentY);
        
        // 新しいユーザー名入力欄を描画
        this.renderUsernameInput(context, layout, contentY + 40);
        
        // バリデーション情報を表示
        this.renderValidationInfo(context, layout, contentY + 120);
    }
    
    /**
     * ユーザー名入力欄を描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderUsernameInput(context, layout, y) {
        const inputWidth = layout.contentWidth - 120;
        const inputHeight = 40;
        const inputX = layout.contentX + 120;
        
        // ラベル
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText('新しいユーザー名:', layout.contentX, y + inputHeight / 2);
        
        // 入力ボックスの背景
        context.fillStyle = this.inputActive ? '#FFFFFF' : '#F8F9FA';
        context.fillRect(inputX, y, inputWidth, inputHeight);
        
        // 入力ボックスの枠線
        context.strokeStyle = this.inputActive ? '#007BFF' : '#DEE2E6';
        context.lineWidth = this.inputActive ? 2 : 1;
        context.strokeRect(inputX, y, inputWidth, inputHeight);
        
        // 入力テキストを描画
        const displayText = this.data.newUsername || '';
        context.fillStyle = displayText ? this.textSettings.contentColor : '#999999';
        context.font = this.textSettings.contentFont;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        
        const textX = inputX + 10;
        const textY = y + inputHeight / 2;
        
        if (displayText) {
            context.fillText(displayText, textX, textY);
        } else {
            context.fillText('ユーザー名を入力してください', textX, textY);
        }
        
        // カーソルを描画
        if (this.inputActive && this.showCursor && displayText) {
            this.renderCursor(context, textX, textY, displayText);
        }
        
        // 文字数カウンターを表示
        this.renderCharacterCounter(context, inputX + inputWidth, y + inputHeight + 5);
    }
    
    /**
     * カーソルを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} textX - テキストX座標
     * @param {number} textY - テキストY座標
     * @param {string} text - 表示テキスト
     */
    renderCursor(context, textX, textY, text) {
        const beforeCursor = text.substring(0, this.cursorPosition);
        const cursorX = textX + context.measureText(beforeCursor).width;
        
        context.strokeStyle = '#333333';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(cursorX, textY - 10);
        context.lineTo(cursorX, textY + 10);
        context.stroke();
    }
    
    /**
     * 文字数カウンターを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    renderCharacterCounter(context, x, y) {
        const currentLength = this.data.newUsername ? this.data.newUsername.length : 0;
        const counterText = `${currentLength}/${this.maxUsernameLength}`;
        
        context.font = '12px sans-serif';
        context.fillStyle = currentLength > this.maxUsernameLength ? '#DC3545' : '#6C757D';
        context.textAlign = 'right';
        context.textBaseline = 'top';
        context.fillText(counterText, x, y);
    }
    
    /**
     * バリデーション情報を表示
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} y - Y座標
     */
    renderValidationInfo(context, layout, y) {
        const validationRules = [
            `• ${this.validation.minLength}文字以上、${this.maxUsernameLength}文字以下`,
            '• 日本語、英数字、スペースが使用可能',
            '• 管理者用語やシステム予約語は使用不可'
        ];
        
        context.font = '12px sans-serif';
        context.fillStyle = '#6C757D';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        for (let i = 0; i < validationRules.length; i++) {
            context.fillText(validationRules[i], layout.contentX, y + i * 18);
        }
    }
    
    /**
     * コンテンツエリアクリック処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @param {Object} layout - レイアウト情報
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentClick(x, y, layout) {
        const contentY = layout.contentY + 50;
        const inputY = contentY + 40;
        const inputX = layout.contentX + 120;
        const inputWidth = layout.contentWidth - 120;
        const inputHeight = 40;
        
        // 入力欄のクリック判定
        if (x >= inputX && x <= inputX + inputWidth && 
            y >= inputY && y <= inputY + inputHeight) {
            this.inputActive = true;
            
            // カーソル位置を計算
            this.calculateCursorPosition(x - inputX - 10);
            return true;
        }
        
        this.inputActive = false;
        return false;
    }
    
    /**
     * コンテンツエリアキーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleContentKeyboard(event) {
        if (!this.inputActive) {
            return false;
        }
        
        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                this.handleBackspace();
                return true;
                
            case 'Delete':
                event.preventDefault();
                this.handleDelete();
                return true;
                
            case 'ArrowLeft':
                event.preventDefault();
                this.cursorPosition = Math.max(0, this.cursorPosition - 1);
                return true;
                
            case 'ArrowRight':
                event.preventDefault();
                const maxPos = this.data.newUsername ? this.data.newUsername.length : 0;
                this.cursorPosition = Math.min(maxPos, this.cursorPosition + 1);
                return true;
                
            case 'Home':
                event.preventDefault();
                this.cursorPosition = 0;
                return true;
                
            case 'End':
                event.preventDefault();
                this.cursorPosition = this.data.newUsername ? this.data.newUsername.length : 0;
                return true;
                
            default:
                if (event.key.length === 1) {
                    event.preventDefault();
                    this.handleCharacterInput(event.key);
                    return true;
                }
                break;
        }
        
        return false;
    }
    
    /**
     * カーソル位置を計算
     * @param {number} clickX - クリック位置（相対X座標）
     */
    calculateCursorPosition(clickX) {
        if (!this.data.newUsername) {
            this.cursorPosition = 0;
            return;
        }
        
        // 仮のcanvasコンテキストを作成してテキスト幅を測定
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = this.textSettings.contentFont;
        
        let bestPosition = 0;
        let minDistance = Math.abs(clickX);
        
        for (let i = 0; i <= this.data.newUsername.length; i++) {
            const textWidth = context.measureText(this.data.newUsername.substring(0, i)).width;
            const distance = Math.abs(clickX - textWidth);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestPosition = i;
            }
        }
        
        this.cursorPosition = bestPosition;
    }
    
    /**
     * Backspace処理
     */
    handleBackspace() {
        if (this.cursorPosition > 0 && this.data.newUsername) {
            const beforeCursor = this.data.newUsername.substring(0, this.cursorPosition - 1);
            const afterCursor = this.data.newUsername.substring(this.cursorPosition);
            this.data.newUsername = beforeCursor + afterCursor;
            this.cursorPosition--;
            this.clearError();
        }
    }
    
    /**
     * Delete処理
     */
    handleDelete() {
        if (this.data.newUsername && this.cursorPosition < this.data.newUsername.length) {
            const beforeCursor = this.data.newUsername.substring(0, this.cursorPosition);
            const afterCursor = this.data.newUsername.substring(this.cursorPosition + 1);
            this.data.newUsername = beforeCursor + afterCursor;
            this.clearError();
        }
    }
    
    /**
     * 文字入力処理
     * @param {string} char - 入力された文字
     */
    handleCharacterInput(char) {
        const currentText = this.data.newUsername || '';
        
        // 文字数制限チェック
        if (currentText.length >= this.maxUsernameLength) {
            this.setError('ユーザー名は10文字以下で入力してください');
            return;
        }
        
        // 文字種チェック
        if (!this.validation.allowedChars.test(char)) {
            this.setError('使用できない文字が含まれています');
            return;
        }
        
        // 文字を挿入
        const beforeCursor = currentText.substring(0, this.cursorPosition);
        const afterCursor = currentText.substring(this.cursorPosition);
        this.data.newUsername = beforeCursor + char + afterCursor;
        this.cursorPosition++;
        
        this.clearError();
    }
    
    /**
     * ユーザー名変更処理
     * @returns {boolean} - 処理成功の場合true
     */
    handleUsernameChange() {
        const newUsername = this.data.newUsername?.trim();
        
        if (!this.validateUsername(newUsername)) {
            return false;
        }
        
        try {
            // プレイヤーデータを更新
            const playerData = this.gameEngine.playerData;
            playerData.setUsername(newUsername);
            
            // 成功結果を返す
            if (this.onResult) {
                this.onResult({
                    action: 'change',
                    data: {
                        oldUsername: this.data.currentUsername,
                        newUsername: newUsername
                    }
                });
            }
            
            return true;
        } catch (error) {
            this.setError('ユーザー名の変更に失敗しました');
            console.error('Username change error:', error);
            return false;
        }
    }
    
    /**
     * ユーザー名のバリデーション
     * @param {string} username - チェックするユーザー名
     * @returns {boolean} - 有効な場合true
     */
    validateUsername(username) {
        if (!username) {
            this.setError('ユーザー名を入力してください');
            return false;
        }
        
        if (username.length < this.validation.minLength) {
            this.setError(`ユーザー名は${this.validation.minLength}文字以上で入力してください`);
            return false;
        }
        
        if (username.length > this.maxUsernameLength) {
            this.setError('ユーザー名は10文字以下で入力してください');
            return false;
        }
        
        if (!this.validation.allowedChars.test(username)) {
            this.setError('使用できない文字が含まれています');
            return false;
        }
        
        // 禁止語チェック
        const lowerUsername = username.toLowerCase();
        for (const prohibitedWord of this.validation.prohibitedWords) {
            if (lowerUsername.includes(prohibitedWord)) {
                this.setError('使用できない単語が含まれています');
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * ユーザー名が有効かチェック
     * @returns {boolean} - 有効な場合true
     */
    isValidUsername() {
        const username = this.data.newUsername?.trim();
        return this.validateUsername(username);
    }
    
    /**
     * エラーを設定
     * @param {string} message - エラーメッセージ
     */
    setError(message) {
        this.data.error = message;
    }
    
    /**
     * エラーをクリア
     */
    clearError() {
        this.data.error = null;
    }
    
    /**
     * フレーム更新処理
     * @param {number} deltaTime - 前フレームからの経過時間
     */
    update(deltaTime) {
        // カーソル点滅処理
        this.cursorBlinkTimer += deltaTime;
        if (this.cursorBlinkTimer >= 500) {
            this.showCursor = !this.showCursor;
            this.cursorBlinkTimer = 0;
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
        this.inputActive = false;
        this.cursorPosition = 0;
        this.cursorBlinkTimer = 0;
    }
}