/**
 * ユーザー名変更ダイアログ
 */
import { ScenesBaseDialog, DialogButton, GameEngine, EventBus, GameState  } from './ScenesBaseDialog.js';

// Type definitions for username dialog
export interface UsernameValidation { allowedChars: RegExp,
    prohibitedWords: string[];
   , minLength: number ,}

export interface TextSettings { contentFont: string;
   , contentColor: string }

export interface UsernameDialogData { currentUsername: string;
    newUsername: string;
   , error: string | null }

export interface PlayerDataManager { getUsername: () => string;
    setUsername: (usernam;e: string) => void }
}

export interface GameEngineWithPlayerData extends GameEngine { playerData: PlayerDataManager
    }

export class UsernameDialog extends ScenesBaseDialog { private title: string
    private maxUsernameLength: number;
    private inputActive: boolean;
    private cursorPosition: number;
    private cursorBlinkTimer: number;
    private showCursor: boolean;
    // 入力検証設定
    private validation: UsernameValidation;
    // テキスト設定
    private textSettings: TextSettings;
    // ダイアログデータ（型安全性のため再定義）
    protected, dialogData: UsernameDialogData,
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: GameState) {

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
    }
            minLength: 1 }
        };
        // テキスト設定のデフォルト値
        this.textSettings = {;
            contentFont: '14px Arial, sans-serif',
            contentColor: '#333333' ,};
        // ダイアログデータの初期化
        this.dialogData = {;
            currentUsername: '',
            newUsername: '';
           , error: null ,}
    
    /**
     * ダイアログの初期化
     * @param options - 初期化オプション
     */
    async initialize(options: Record<string, unknown> = { ): Promise<void> {
        await super.initialize(options);
        
        // 現在のユーザー名を取得
        const gameEngine = this.gameEngine as GameEngineWithPlayerData;
        const playerData = gameEngine.playerData;''
        this.dialogData.currentUsername = playerData.getUsername(') || '';
        this.dialogData.newUsername = this.dialogData.currentUsername;
        this.dialogData.error = null;
        
        this.cursorPosition = this.dialogData.newUsername.length;
        this.inputActive = true; }
    
    /**
     * ボタンの設定'
     */''
    setupButtons(''';
                text: '変更',)';
                color: '#28A745');
               , callback: () => this.handleUsernameChange(),
                get disabled() { ''
                    return !this.isValidUsername(''';
                text: 'キャンセル',)';
                color: '#6C757D',);
                callback: () => this.handleCancel() ,}
            }
        ];
    }
    
    /**
     * コンテンツを描画
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     */'
    protected renderContent(context: CanvasRenderingContext2D, layout?: Record<string, number>): void { ''
        const contentY = (layout? .contentY || this.layout.y) + 50;
        const contentX = layout?.contentX || this.layout.x;
        const contentWidth = layout?.contentWidth || this.layout.width;
        
        // 現在のユーザー名を表示
        context.font = this.textSettings.contentFont;
        context.fillStyle = this.textSettings.contentColor;''
        context.textAlign = 'left';''
        context.textBaseline = 'top';

         : undefined'';
        context.fillText('現在のユーザー名:', contentX, contentY);''
        context.fillText(this.dialogData.currentUsername || '(未設定)', contentX + 120, contentY);
        
        // 新しいユーザー名入力欄を描画
        this.renderUsernameInput(context, { contentX, contentWidth ), contentY + 40);
        
        // バリデーション情報を表示
        this.renderValidationInfo(context, { contentX ), contentY + 120); }
    
    /**
     * ユーザー名入力欄を描画
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     * @param y - Y座標
     */
    private renderUsernameInput(;
        context: CanvasRenderingContext2D);
       , layout: { contentX: number;, contentWidth: number ), 
        y: number'';
    '): void {'
        const inputWidth = layout.contentWidth - 120,
        const inputHeight = 40;
        const inputX = layout.contentX + 120;
        
        // ラベル
        context.font = this.textSettings.contentFont;

        context.fillStyle = this.textSettings.contentColor;''
        context.textAlign = 'left';''
        context.textBaseline = 'middle';''
        context.fillText('新しいユーザー名:', layout.contentX, y + inputHeight / 2);
        ';
        // 入力ボックスの背景
        context.fillStyle = this.inputActive ? '#FFFFFF' : '#F8F9FA';''
        context.fillRect(inputX, y, inputWidth, inputHeight);
        ';
        // 入力ボックスの枠線
        context.strokeStyle = this.inputActive ? '#007BFF' : '#DEE2E6';

        context.lineWidth = this.inputActive ? 2 : 1;''
        context.strokeRect(inputX, y, inputWidth, inputHeight);
        ';
        // 入力テキストを描画
        const displayText = this.dialogData.newUsername || '';''
        context.fillStyle = displayText ? this.textSettings.contentColor: '#999999',
        context.font = this.textSettings.contentFont;''
        context.textAlign = 'left';''
        context.textBaseline = 'middle';
        
        const textX = inputX + 10;
        const textY = y + inputHeight / 2;
        
        if(displayText) {
        ';

            ';

        }

            context.fillText(displayText, textX, textY); }

        } else { }'

            context.fillText('ユーザー名を入力してください', textX, textY); }
        }
        
        // カーソルを描画
        if (this.inputActive && this.showCursor && displayText) { this.renderCursor(context, textX, textY, displayText); }
        
        // 文字数カウンターを表示
        this.renderCharacterCounter(context, inputX + inputWidth, y + inputHeight + 5);
    }
    
    /**
     * カーソルを描画
     * @param context - Canvas描画コンテキスト
     * @param textX - テキストX座標
     * @param textY - テキストY座標
     * @param text - 表示テキスト
     */
    private renderCursor(context: CanvasRenderingContext2D, textX: number, textY: number, text: string): void { const beforeCursor = text.substring(0, this.cursorPosition);''
        const cursorX = textX + context.measureText(beforeCursor).width;

        context.strokeStyle = '#333333';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(cursorX, textY - 10);
        context.lineTo(cursorX, textY + 10);
        context.stroke(); }
    
    /**
     * 文字数カウンターを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標'
     */''
    private renderCharacterCounter(context: CanvasRenderingContext2D, x: number, y: number): void { const currentLength = this.dialogData.newUsername ? this.dialogData.newUsername.length: 0 
        const counterText = `${currentLength}/${this.maxUsernameLength}`;

        context.font = '12px sans-serif';''
        context.fillStyle = currentLength > this.maxUsernameLength ? '#DC3545' : '#6C757D';''
        context.textAlign = 'right';''
        context.textBaseline = 'top';
        context.fillText(counterText, x, y);
    }
    
    /**
     * バリデーション情報を表示
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     * @param y - Y座標'
     */''
    private renderValidationInfo(context: CanvasRenderingContext2D, layout: { contentX: number ), y: number'): void {'
        const validationRules = [,}

            `• ${this.validation.minLength}文字以上、${this.maxUsernameLength}文字以下`,'', '• 日本語、英数字、スペースが使用可能',]';
            '• 管理者用語やシステム予約語は使用不可'];
        ];

        context.font = '12px sans-serif';''
        context.fillStyle = '#6C757D';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';
        
        for (let, i = 0; i < validationRules.length; i++) { context.fillText(validationRules[i], layout.contentX, y + i * 18); }
    }
    
    /**
     * コンテンツエリアクリック処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @param layout - レイアウト情報
     * @returns イベントが処理された場合true
     */
    protected handleContentClick(x: number, y: number, layout?: Record<string, number>): boolean { const contentY = (layout? .contentY || this.layout.y) + 50;
        const inputY = contentY + 40;
        const inputX = (layout?.contentX || this.layout.x) + 120;
        const inputWidth = (layout?.contentWidth || this.layout.width) - 120;
        const inputHeight = 40;
        
        // 入力欄のクリック判定
        if(x >= inputX && x <= inputX + inputWidth && );
            y >= inputY && y <= inputY + inputHeight) {
            this.inputActive = true;
            
            // カーソル位置を計算
            this.calculateCursorPosition(x - inputX - 10);
        }
            return true;
        
        this.inputActive = false;
        return false;
    }
    
    /**
     * コンテンツエリアキーボード処理
     * @param event - キーボードイベント
     * @returns イベントが処理された場合true
     */ : undefined
    protected handleContentKeyboard(event: KeyboardEvent): boolean { if (!this.inputActive) {
            return false; }

        switch(event.key) {'

            case 'Backspace':';
                event.preventDefault();''
                this.handleBackspace()';
            case 'Delete':)';
                event.preventDefault();''
                this.handleDelete()';
            case 'ArrowLeft':)';
                event.preventDefault();''
                this.cursorPosition = Math.max(0, this.cursorPosition - 1);
                return true;

            case 'ArrowRight':;
                event.preventDefault();

                const maxPos = this.dialogData.newUsername ? this.dialogData.newUsername.length: 0,
                this.cursorPosition = Math.min(maxPos, this.cursorPosition + 1);
                return true;

            case 'Home':'';
                event.preventDefault()';
            case 'End':);
                event.preventDefault();
                this.cursorPosition = this.dialogData.newUsername ? this.dialogData.newUsername.length: 0,
                return true;
                
            default:;
                if (event.key.length === 1) {
                    event.preventDefault(),
                    this.handleCharacterInput(event.key);
        }
                    return true;
                break;
        }
        
        return false;
    }
    
    /**
     * カーソル位置を計算
     * @param clickX - クリック位置（相対X座標）
     */'
    private calculateCursorPosition(clickX: number): void { ''
        if(!this.dialogData.newUsername) {
            this.cursorPosition = 0;
        }
            return; }
        }
        ';
        // 仮のcanvasコンテキストを作成してテキスト幅を測定
        const canvas = document.createElement('canvas'');''
        const context = canvas.getContext('2d)!;
        context.font = this.textSettings.contentFont;
        
        let bestPosition = 0;
        let minDistance = Math.abs(clickX);
        
        for(let, i = 0; i <= this.dialogData.newUsername.length; i++) {
        
            const textWidth = context.measureText(this.dialogData.newUsername.substring(0, i).width;
            const distance = Math.abs(clickX - textWidth);
            
            if (distance < minDistance) {
                minDistance = distance;
        
        }
                bestPosition = i; }
}
        
        this.cursorPosition = bestPosition;
    }
    
    /**
     * Backspace処理
     */
    private handleBackspace(): void { if (this.cursorPosition > 0 && this.dialogData.newUsername) {
            const beforeCursor = this.dialogData.newUsername.substring(0, this.cursorPosition - 1);
            const afterCursor = this.dialogData.newUsername.substring(this.cursorPosition);
            this.dialogData.newUsername = beforeCursor + afterCursor;
            this.cursorPosition--;
            this.clearError(); }
    }
    
    /**
     * Delete処理
     */
    private handleDelete(): void { if (this.dialogData.newUsername && this.cursorPosition < this.dialogData.newUsername.length) {
            const beforeCursor = this.dialogData.newUsername.substring(0, this.cursorPosition);
            const afterCursor = this.dialogData.newUsername.substring(this.cursorPosition + 1);
            this.dialogData.newUsername = beforeCursor + afterCursor;
            this.clearError(); }
    }
    
    /**
     * 文字入力処理
     * @param char - 入力された文字'
     */''
    private handleCharacterInput(char: string): void { ''
        const currentText = this.dialogData.newUsername || '';
        ';
        // 文字数制限チェック
        if(currentText.length >= this.maxUsernameLength) {'

            this.setError('ユーザー名は10文字以下で入力してください);
        }
            return; }
        }
        ';
        // 文字種チェック
        if(!this.validation.allowedChars.test(char)) { ''
            this.setError('使用できない文字が含まれています);
            return; }
        
        // 文字を挿入
        const beforeCursor = currentText.substring(0, this.cursorPosition);
        const afterCursor = currentText.substring(this.cursorPosition);
        this.dialogData.newUsername = beforeCursor + char + afterCursor;
        this.cursorPosition++;
        
        this.clearError();
    }
    
    /**
     * ユーザー名変更処理
     * @returns 処理成功の場合true
     */
    private handleUsernameChange(): boolean { const newUsername = this.dialogData.newUsername? .trim();
        
        if(!this.validateUsername(newUsername) {
        
            
        
        }
            return false;
        
        try { // プレイヤーデータを更新
            const gameEngine = this.gameEngine as GameEngineWithPlayerData;
            const playerData = gameEngine.playerData;
            playerData.setUsername(newUsername);
            // 成功結果を返す
            if(this.onResult) {'
                this.onResult({ : undefined''
                    action: 'change';
                   , data: {)
                        oldUsername: this.dialogData.currentUsername ,}
                        newUsername: newUsername) }
                    });
            }
            ';

            return true;''
        } catch (error) {
            this.setError('ユーザー名の変更に失敗しました'');''
            console.error('Username change error:', error);
            return false;
    
    /**
     * ユーザー名のバリデーション
     * @param username - チェックするユーザー名
     * @returns 有効な場合true
     */'
    private validateUsername(username?: string): boolean { ''
        if(!username) {'

            this.setError('ユーザー名を入力してください);
        }
            return false;
        
        if(username.length < this.validation.minLength) {
        
            
        
        }
            this.setError(`ユーザー名は${this.validation.minLength}文字以上で入力してください`});
            return false;
        }

        if(username.length > this.maxUsernameLength) {'

            this.setError('ユーザー名は10文字以下で入力してください);
        }
            return false;

        if(!this.validation.allowedChars.test(username)) { ''
            this.setError('使用できない文字が含まれています);
            return false; }
        
        // 禁止語チェック
        const lowerUsername = username.toLowerCase();
        for(const, prohibitedWord of, this.validation.prohibitedWords) {

            if(lowerUsername.includes(prohibitedWord)) {''
                this.setError('使用できない単語が含まれています);
        }
                return false;
        
        return true;
    }
    
    /**
     * ユーザー名が有効かチェック
     * @returns 有効な場合true
     */
    private isValidUsername(): boolean { const username = this.dialogData.newUsername? .trim();
        return this.validateUsername(username); }
    
    /**
     * エラーを設定
     * @param message - エラーメッセージ
     */ : undefined
    private setError(message: string): void { this.dialogData.error = message; }
    
    /**
     * エラーをクリア
     */
    private clearError(): void { this.dialogData.error = null; }
    
    /**
     * フレーム更新処理
     * @param deltaTime - 前フレームからの経過時間
     */
    update(deltaTime: number): void { // カーソル点滅処理
        this.cursorBlinkTimer += deltaTime;
        if(this.cursorBlinkTimer >= 500) {
            this.showCursor = !this.showCursor;
        }
            this.cursorBlinkTimer = 0; }
}
    
    /**
     * クリーンアップ
     */
    cleanup(): void { ''
        super.cleanup(' }'