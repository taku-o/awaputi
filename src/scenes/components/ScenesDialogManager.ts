/**
 * シーン用ダイアログ管理システム
 * シーンコンポーネントのダイアログ機能を統一管理
 */

import { ScenesBaseDialog, DialogData, GameEngine, EventBus, GameState, AccessibilitySettings  } from './ScenesBaseDialog.js';

// Type definitions for dialog management
export interface DialogClass {;
    new(gameEngine: GameEngine, eventBus: EventBus, state: GameState): ScenesBaseDialog
    ,}

export interface DialogStackItem { type: string,
    data: DialogData
    ,}

export interface DialogInfo { type: string;
    data: DialogData;
   , DialogClass: DialogClass
    }

export interface LayoutConfig { minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    padding: number;
    buttonHeight: number;
   , buttonSpacing: number }

export interface AnimationConfig { fadeInDuration: number;
    fadeOutDuration: number;
    scaleInDuration: number;
   , enabled: boolean }

export interface AnimationState { isAnimating: boolean;
   , startTime: number,
    type: 'fade-in' | 'fade-out' | 'scale-in' | null ,}

export interface DialogLayout { x: number;
    y: number;
    width: number;
    height: number;
    contentX: number;
    contentY: number;
    contentWidth: number;
    contentHeight: number;
    buttonY: number;
    buttonWidth: number;
   , buttonHeight: number }

export class ScenesDialogManager {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private state: GameState;
    // ダイアログレジストリ
    private, dialogs: Map<string, DialogClass>;
    
    // ダイアログスタック（複数ダイアログ対応）
    private dialogStack: DialogStackItem[];
    // 共通レイアウト設定
    private layout: LayoutConfig;
    // アニメーション設定
    private animation: AnimationConfig;
    // 現在のアニメーション状態
    private, animationState: AnimationState;
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: GameState) {

        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        // ダイアログレジストリ
        this.dialogs = new Map('';
    ,}

            type: null // 'fade-in', 'fade-out', 'scale-in' }
        };
        
        // イベントリスナー)
        this.setupEventListeners();
    }
    
    /**
     * ダイアログクラスを登録
     * @param type - ダイアログタイプ
     * @param DialogClass - ダイアログクラス
     */
    registerDialog(type: string, DialogClass: DialogClass): void { this.dialogs.set(type, DialogClass); }
    
    /**
     * ダイアログを表示
     * @param type - ダイアログタイプ
     * @param options - ダイアログオプション
     * @returns ダイアログの結果
     */
    async showDialog(type: string, options: DialogData = { ): Promise<unknown> {
        try {
            // ダイアログクラスが登録されているかチェック
            if(!this.dialogs.has(type)) {' }'

                throw new Error(`Dialog, type '${type}' is, not registered`});
            }
            
            // 現在のダイアログをスタックに追加
            if(this.state.showingDialog) {
                this.dialogStack.push({
            })
                    type: this.state.showingDialog,) }
                    data: { ...this.state.dialogData);
            }
            
            // 新しいダイアログを作成
            const DialogClass = this.dialogs.get(type)!;
            const dialog = new DialogClass(this.gameEngine, this.eventBus, this.state);
            
            // ダイアログの初期化
            await dialog.initialize(options);
            // 状態を更新
            if(this.state.set) {'

                this.state.set('showingDialog', type, false);

            }

                this.state.set('dialogData', dialog.getData(), false); }
            }
            ';
            // アニメーション開始
            if(this.animation.enabled) {', ';

            }

                this.startAnimation('fade-in''); }
            }
            ';
            // イベント通知
            this.eventBus.emit('dialog-opened', { type, options );
            
            // ダイアログの結果を待機
            return new Promise((resolve, reject) => { 
                dialog.onResult = (result) => { }
                    this.closeDialog().then(() => resolve(result).catch(reject);
                
                dialog.onError = (error) => { this.closeDialog().then(() => reject(error).catch(reject); }
                });''
        } catch (error) {
            this.handleError('showDialog', error as Error);
            throw error; }
    }
    
    /**
     * 現在のダイアログを閉じる
     * @returns 閉じる処理の完了
     */
    async closeDialog(): Promise<void> { try {
            if(!this.state.showingDialog) {
                
            }
                return; }
            }
            
            const currentType = this.state.showingDialog;
            ';
            // アニメーション開始
            if(this.animation.enabled) {'

                this.startAnimation('fade-out);
            }
                await this.waitForAnimation(); }
            }
            ';
            // 状態をクリア
            if(this.state.set) {'

                this.state.set('showingDialog', null, false);

            }

                this.state.set('dialogData', {), false); }
            
            // スタックから前のダイアログを復元
            if(this.dialogStack.length > 0) {
                const previousDialog = this.dialogStack.pop()!;''
                if(this.state.set) {''
                    this.state.set('showingDialog', previousDialog.type, false);

            }

                    this.state.set('dialogData', previousDialog.data, false); }
}
            ';
            // イベント通知
            this.eventBus.emit('dialog-closed', { type: currentType ),' }

        } catch (error) {
            this.handleError('closeDialog', error as Error); }
    }
    
    /**
     * 現在のダイアログを取得
     * @returns 現在のダイアログ情報
     */
    getCurrentDialog(): DialogInfo | null { const type = this.state.showingDialog;
        if(!type || !this.dialogs.has(type) {
            
        }
            return null;
        
        return { type, }
            data: this.state.dialogData || {};
            DialogClass: this.dialogs.get(type)!;
        },
    }
    
    /**
     * ダイアログが表示されているかチェック
     * @returns ダイアログが表示されている場合true
     */
    isDialogOpen(): boolean { return this.state.showingDialog !== null; }
    
    /**
     * メインレンダリング処理
     * @param context - Canvas描画コンテキスト
     */
    render(context: CanvasRenderingContext2D): void { if(!this.isDialogOpen() {
            return; }
        
        try { const currentDialog = this.getCurrentDialog();
            if(!currentDialog) {
                
            }
                return; }
            }
            
            // ダイアログのレイアウト計算
            const layout = this.calculateDialogLayout(context.canvas);
            
            // 背景オーバーレイの描画
            this.renderOverlay(context, layout);
            
            // ダイアログ本体の描画
            this.renderDialogContent(context, layout, currentDialog);
            
            // アニメーション処理
            this.updateAnimation(context, layout);''
        } catch (error) {
            this.handleError('render', error as Error);
            this.renderErrorDialog(context); }
    }
    
    /**
     * ダイアログのレイアウトを計算
     * @param canvas - Canvasエレメント
     * @returns レイアウト情報
     */
    private calculateDialogLayout(canvas: HTMLCanvasElement): DialogLayout { const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // ダイアログサイズを計算
        const width = Math.min();
            Math.max(this.layout.minWidth, canvasWidth * 0.4),
            this.layout.maxWidth;
        );
        const height = Math.min();
            Math.max(this.layout.minHeight, canvasHeight * 0.5),
            this.layout.maxHeight;
        );
        
        // ダイアログ位置を中央に配置
        const x = (canvasWidth - width) / 2;
        const y = (canvasHeight - height) / 2;
        
        return { x, y, width, height,
            contentX: x + this.layout.padding;
            contentY: y + this.layout.padding;
            contentWidth: width - (this.layout.padding * 2);
            contentHeight: height - (this.layout.padding * 2);
            buttonY: y + height - this.layout.padding - this.layout.buttonHeight;
           , buttonWidth: (width - (this.layout.padding * 3)) / 2, };
            buttonHeight: this.layout.buttonHeight }
        }
    
    /**
     * 背景オーバーレイを描画
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     */''
    private renderOverlay(context: CanvasRenderingContext2D, layout: DialogLayout): void { // 背景をダークオーバーレイで覆う
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';''
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // ダイアログ背景を描画
        const cornerRadius = 8; }
        const { x, y, width, height } = layout;
        
        // アクセシビリティ設定に応じた色調整
        const backgroundColor = this.state.accessibilitySettings? .highContrast '';
            ? '#FFFFFF'  : undefined'';
            : '#F8F9FA';
        
        context.fillStyle = backgroundColor;

        this.roundRect(context, x, y, width, height, cornerRadius);''
        context.fill(''';
            ? '#000000'  : undefined'';
            : '#DEE2E6';)
        context.lineWidth = 1;)
        this.roundRect(context, x, y, width, height, cornerRadius);
        context.stroke();
    }
    
    /**
     * ダイアログコンテンツを描画
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     * @param dialogInfo - ダイアログ情報
     */
    private renderDialogContent(context: CanvasRenderingContext2D, layout: DialogLayout, dialogInfo: DialogInfo): void { const DialogClass = dialogInfo.DialogClass;
        const dialogInstance = new DialogClass(this.gameEngine, this.eventBus, this.state);
        
        // ダイアログの個別レンダリング
        dialogInstance.render(context, layout); }
    
    /**
     * エラーダイアログを描画
     * @param context - Canvas描画コンテキスト
     */
    private renderErrorDialog(context: CanvasRenderingContext2D): void { ''
        const layout = this.calculateDialogLayout(context.canvas);
        ';
        // エラー背景
        context.fillStyle = '#FF6B6B';

        this.roundRect(context, layout.x, layout.y, layout.width, layout.height, 8);''
        context.fill(''';
        context.fillStyle = '#FFFFFF';''
        context.font = '16px, sans-serif';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';

        context.fillText()';
            'ダイアログの表示でエラーが発生しました');
            layout.x + layout.width / 2,);
            layout.y + layout.height / 2); }
    
    /**
     * クリックイベントを処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @returns イベントが処理された場合true
     */
    handleClick(x: number, y: number): boolean { if(!this.isDialogOpen() {
            return false; }
        
        try { const currentDialog = this.getCurrentDialog();
            if(!currentDialog) {
                
            }
                return false;
            
            // ダイアログレイアウト計算
            const layout = this.calculateDialogLayout(this.gameEngine.canvas!);
            
            // ダイアログ外をクリックした場合は閉じる
            if(x < layout.x || x > layout.x + layout.width ||);
                y < layout.y || y > layout.y + layout.height) {
                this.closeDialog();
            }
                return true;
            
            // ダイアログ内のクリック処理
            const DialogClass = currentDialog.DialogClass;
            const dialogInstance = new DialogClass(this.gameEngine, this.eventBus, this.state);
            ';

            return dialogInstance.handleClick(x, y, layout);''
        } catch (error) {
            this.handleError('handleClick', error as Error);
            return false;
    
    /**
     * キーボード入力を処理
     * @param event - キーボードイベント
     * @returns イベントが処理された場合true
     */'
    handleKeyboard(event: KeyboardEvent): boolean { ''
        if(!this.isDialogOpen()) {
            return false; ,}
        ';
        try { // Escapeキーでダイアログを閉じる
            if(event.key === 'Escape) {'
                this.closeDialog();
            }
                return true;
            
            const currentDialog = this.getCurrentDialog();
            if (!currentDialog) { return false; }
            
            // ダイアログ固有のキーボード処理
            const DialogClass = currentDialog.DialogClass;
            const dialogInstance = new DialogClass(this.gameEngine, this.eventBus, this.state);
            ';

            return dialogInstance.handleKeyboard(event);''
        } catch (error) {
            this.handleError('handleKeyboard', error as Error);
            return false;
    
    /**
     * アニメーションを開始
     * @param type - アニメーションタイプ'
     */''
    private startAnimation(type: 'fade-in' | 'fade-out' | 'scale-in): void { if (!this.animation.enabled) {
            return; ,}
        
        this.animationState = { isAnimating: true,
            startTime: performance.now();
            type ,}
    
    /**
     * アニメーションを更新
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     */
    private updateAnimation(context: CanvasRenderingContext2D, layout: DialogLayout): void { if (!this.animationState.isAnimating) {
            return; }

        const elapsed = performance.now()';
        const durationKey = (this.animationState.type!.replace('-', ''') + 'Duration') as keyof AnimationConfig;
        const duration = this.animation[durationKey] as number;
        const progress = Math.min(elapsed / duration, 1);
        
        // アニメーション効果を適用
        this.applyAnimationEffect(context, layout, progress);
        
        // アニメーション完了チェック
        if (progress >= 1) { this.animationState.isAnimating = false; }
    }
    
    /**
     * アニメーション効果を適用
     * @param context - Canvas描画コンテキスト
     * @param layout - レイアウト情報
     * @param progress - アニメーション進行度(0-1)
     */''
    private applyAnimationEffect(context: CanvasRenderingContext2D, layout: DialogLayout, progress: number): void {
        const { type } = this.animationState;

        if (type === 'fade-in'') { context.globalAlpha = progress;' }

        } else if (type === 'fade-out'') { context.globalAlpha = 1 - progress;' }

        } else if(type === 'scale-in) { const scale = 0.8 + (0.2 * progress);
            const centerX = layout.x + layout.width / 2;
            const centerY = layout.y + layout.height / 2;
            
            context.save();
            context.translate(centerX, centerY);
            context.scale(scale, scale);
            context.translate(-centerX, -centerY); }
    }
    
    /**
     * アニメーション完了を待機
     * @returns アニメーション完了のPromise
     */
    private waitForAnimation(): Promise<void> { if (!this.animationState.isAnimating) {
            return Promise.resolve(); }
        
        return new Promise((resolve) => {  const checkComplete = () => {
                if (!this.animationState.isAnimating) { }
                    resolve(); else { requestAnimationFrame(checkComplete); }
            };
            checkComplete();
        });
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
    private roundRect(;
        context: CanvasRenderingContext2D;
       , x: number, ;
        y: number, ;
        width: number );
        height: number);
       , radius: number;
    ): void { context.beginPath(),
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath(); }
    
    /**
     * イベントリスナーをセットアップ
     */'
    private setupEventListeners(): void { // 状態変更の監視
        if(this.state.onChange) {'

            this.state.onChange('accessibilitySettings', (newSettings) => { 
        }
                const settings = newSettings as AccessibilitySettings; }

                this.animation.enabled = !settings.reducedMotion;' }'

            }');
        }
        ';
        // エラーイベントの監視
        this.eventBus.on('component-error', (error) => {  }

            const errorData = error as { component: string;, error: Error }''
            if(errorData.component === 'dialog'') {', ';

            }

                this.handleError('component-error', errorData.error); }
});
    }
    
    /**
     * エラーハンドリング
     * @param operation - 操作名
     * @param error - エラーオブジェクト
     */'
    private handleError(operation: string, error: Error): void { ''
        console.error(`DialogManager ${operation) error:`, error');
        ';
        // エラーイベントを発火
        this.eventBus.emit('component-error', {)'
            component: 'DialogManager')';
            operation,')';
            error)');
        ';
        // 重大なエラーの場合はダイアログを強制終了
        if(operation === 'render' || operation === 'showDialog} {'

            if(this.state.set} {'
        }

                this.state.set('showingDialog', null, false);' }

                this.state.set('dialogData', {), false});
            }
}
    
    /**
     * クリーンアップ
     */'
    cleanup(): void { ''
        this.dialogs.clear(' }'