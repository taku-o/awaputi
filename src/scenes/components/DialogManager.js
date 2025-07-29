/**
 * ダイアログ管理システム
 * UserInfoSceneのダイアログ機能を統一管理
 */
export class DialogManager {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // ダイアログレジストリ
        this.dialogs = new Map();
        
        // ダイアログスタック（複数ダイアログ対応）
        this.dialogStack = [];
        
        // 共通レイアウト設定
        this.layout = {
            minWidth: 400,
            minHeight: 300,
            maxWidth: 600,
            maxHeight: 500,
            padding: 20,
            buttonHeight: 40,
            buttonSpacing: 10
        };
        
        // アニメーション設定
        this.animation = {
            fadeInDuration: 200,
            fadeOutDuration: 150,
            scaleInDuration: 250,
            enabled: !state.accessibilitySettings?.reducedMotion
        };
        
        // 現在のアニメーション状態
        this.animationState = {
            isAnimating: false,
            startTime: 0,
            type: null // 'fade-in', 'fade-out', 'scale-in'
        };
        
        // イベントリスナー
        this.setupEventListeners();
    }
    
    /**
     * ダイアログクラスを登録
     * @param {string} type - ダイアログタイプ
     * @param {Class} DialogClass - ダイアログクラス
     */
    registerDialog(type, DialogClass) {
        this.dialogs.set(type, DialogClass);
    }
    
    /**
     * ダイアログを表示
     * @param {string} type - ダイアログタイプ
     * @param {Object} options - ダイアログオプション
     * @returns {Promise} - ダイアログの結果
     */
    async showDialog(type, options = {}) {
        try {
            // ダイアログクラスが登録されているかチェック
            if (!this.dialogs.has(type)) {
                throw new Error(`Dialog type '${type}' is not registered`);
            }
            
            // 現在のダイアログをスタックに追加
            if (this.state.showingDialog) {
                this.dialogStack.push({
                    type: this.state.showingDialog,
                    data: { ...this.state.dialogData }
                });
            }
            
            // 新しいダイアログを作成
            const DialogClass = this.dialogs.get(type);
            const dialog = new DialogClass(this.gameEngine, this.eventBus, this.state);
            
            // ダイアログの初期化
            await dialog.initialize(options);
            
            // 状態を更新
            this.state.set('showingDialog', type, false);
            this.state.set('dialogData', dialog.getData(), false);
            
            // アニメーション開始
            if (this.animation.enabled) {
                this.startAnimation('fade-in');
            }
            
            // イベント通知
            this.eventBus.emit('dialog-opened', { type, options });
            
            // ダイアログの結果を待機
            return new Promise((resolve, reject) => {
                dialog.onResult = (result) => {
                    this.closeDialog().then(() => resolve(result)).catch(reject);
                };
                
                dialog.onError = (error) => {
                    this.closeDialog().then(() => reject(error)).catch(reject);
                };
            });
        } catch (error) {
            this.handleError('showDialog', error);
            throw error;
        }
    }
    
    /**
     * 現在のダイアログを閉じる
     * @returns {Promise} - 閉じる処理の完了
     */
    async closeDialog() {
        try {
            if (!this.state.showingDialog) {
                return;
            }
            
            const currentType = this.state.showingDialog;
            
            // アニメーション開始
            if (this.animation.enabled) {
                this.startAnimation('fade-out');
                await this.waitForAnimation();
            }
            
            // 状態をクリア
            this.state.set('showingDialog', null, false);
            this.state.set('dialogData', {}, false);
            
            // スタックから前のダイアログを復元
            if (this.dialogStack.length > 0) {
                const previousDialog = this.dialogStack.pop();
                this.state.set('showingDialog', previousDialog.type, false);
                this.state.set('dialogData', previousDialog.data, false);
            }
            
            // イベント通知
            this.eventBus.emit('dialog-closed', { type: currentType });
        } catch (error) {
            this.handleError('closeDialog', error);
        }
    }
    
    /**
     * 現在のダイアログを取得
     * @returns {Object|null} - 現在のダイアログ情報
     */
    getCurrentDialog() {
        const type = this.state.showingDialog;
        if (!type || !this.dialogs.has(type)) {
            return null;
        }
        
        return {
            type,
            data: this.state.dialogData,
            DialogClass: this.dialogs.get(type)
        };
    }
    
    /**
     * ダイアログが表示されているかチェック
     * @returns {boolean} - ダイアログが表示されている場合true
     */
    isDialogOpen() {
        return this.state.showingDialog !== null;
    }
    
    /**
     * メインレンダリング処理
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    render(context) {
        if (!this.isDialogOpen()) {
            return;
        }
        
        try {
            const currentDialog = this.getCurrentDialog();
            if (!currentDialog) {
                return;
            }
            
            // ダイアログのレイアウト計算
            const layout = this.calculateDialogLayout(context.canvas);
            
            // 背景オーバーレイの描画
            this.renderOverlay(context, layout);
            
            // ダイアログ本体の描画
            this.renderDialogContent(context, layout, currentDialog);
            
            // アニメーション処理
            this.updateAnimation(context, layout);
        } catch (error) {
            this.handleError('render', error);
            this.renderErrorDialog(context);
        }
    }
    
    /**
     * ダイアログのレイアウトを計算
     * @param {HTMLCanvasElement} canvas - Canvasエレメント
     * @returns {Object} - レイアウト情報
     */
    calculateDialogLayout(canvas) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // ダイアログサイズを計算
        const width = Math.min(
            Math.max(this.layout.minWidth, canvasWidth * 0.4),
            this.layout.maxWidth
        );
        const height = Math.min(
            Math.max(this.layout.minHeight, canvasHeight * 0.5),
            this.layout.maxHeight
        );
        
        // ダイアログ位置を中央に配置
        const x = (canvasWidth - width) / 2;
        const y = (canvasHeight - height) / 2;
        
        return {
            x, y, width, height,
            contentX: x + this.layout.padding,
            contentY: y + this.layout.padding,
            contentWidth: width - (this.layout.padding * 2),
            contentHeight: height - (this.layout.padding * 2),
            buttonY: y + height - this.layout.padding - this.layout.buttonHeight,
            buttonWidth: (width - (this.layout.padding * 3)) / 2,
            buttonHeight: this.layout.buttonHeight
        };
    }
    
    /**
     * 背景オーバーレイを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    renderOverlay(context, layout) {
        // 背景をダークオーバーレイで覆う
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // ダイアログ背景を描画
        const cornerRadius = 8;
        const { x, y, width, height } = layout;
        
        // アクセシビリティ設定に応じた色調整
        const backgroundColor = this.state.accessibilitySettings.highContrast 
            ? '#FFFFFF' 
            : '#F8F9FA';
        
        context.fillStyle = backgroundColor;
        this.roundRect(context, x, y, width, height, cornerRadius);
        context.fill();
        
        // ダイアログの境界線
        context.strokeStyle = this.state.accessibilitySettings.highContrast 
            ? '#000000' 
            : '#DEE2E6';
        context.lineWidth = 1;
        this.roundRect(context, x, y, width, height, cornerRadius);
        context.stroke();
    }
    
    /**
     * ダイアログコンテンツを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {Object} dialogInfo - ダイアログ情報
     */
    renderDialogContent(context, layout, dialogInfo) {
        const DialogClass = dialogInfo.DialogClass;
        const dialogInstance = new DialogClass(this.gameEngine, this.eventBus, this.state);
        
        // ダイアログの個別レンダリング
        dialogInstance.render(context, layout);
    }
    
    /**
     * エラーダイアログを描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     */
    renderErrorDialog(context) {
        const layout = this.calculateDialogLayout(context.canvas);
        
        // エラー背景
        context.fillStyle = '#FF6B6B';
        this.roundRect(context, layout.x, layout.y, layout.width, layout.height, 8);
        context.fill();
        
        // エラーメッセージ
        context.fillStyle = '#FFFFFF';
        context.font = '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            'ダイアログの表示でエラーが発生しました',
            layout.x + layout.width / 2,
            layout.y + layout.height / 2
        );
    }
    
    /**
     * クリックイベントを処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {boolean} - イベントが処理された場合true
     */
    handleClick(x, y) {
        if (!this.isDialogOpen()) {
            return false;
        }
        
        try {
            const currentDialog = this.getCurrentDialog();
            if (!currentDialog) {
                return false;
            }
            
            // ダイアログレイアウト計算
            const layout = this.calculateDialogLayout(this.gameEngine.canvas);
            
            // ダイアログ外をクリックした場合は閉じる
            if (x < layout.x || x > layout.x + layout.width ||
                y < layout.y || y > layout.y + layout.height) {
                this.closeDialog();
                return true;
            }
            
            // ダイアログ内のクリック処理
            const DialogClass = currentDialog.DialogClass;
            const dialogInstance = new DialogClass(this.gameEngine, this.eventBus, this.state);
            
            return dialogInstance.handleClick(x, y, layout);
        } catch (error) {
            this.handleError('handleClick', error);
            return false;
        }
    }
    
    /**
     * キーボード入力を処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleKeyboard(event) {
        if (!this.isDialogOpen()) {
            return false;
        }
        
        try {
            // Escapeキーでダイアログを閉じる
            if (event.key === 'Escape') {
                this.closeDialog();
                return true;
            }
            
            const currentDialog = this.getCurrentDialog();
            if (!currentDialog) {
                return false;
            }
            
            // ダイアログ固有のキーボード処理
            const DialogClass = currentDialog.DialogClass;
            const dialogInstance = new DialogClass(this.gameEngine, this.eventBus, this.state);
            
            return dialogInstance.handleKeyboard(event);
        } catch (error) {
            this.handleError('handleKeyboard', error);
            return false;
        }
    }
    
    /**
     * アニメーションを開始
     * @param {string} type - アニメーションタイプ
     */
    startAnimation(type) {
        if (!this.animation.enabled) {
            return;
        }
        
        this.animationState = {
            isAnimating: true,
            startTime: performance.now(),
            type
        };
    }
    
    /**
     * アニメーションを更新
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     */
    updateAnimation(context, layout) {
        if (!this.animationState.isAnimating) {
            return;
        }
        
        const elapsed = performance.now() - this.animationState.startTime;
        const duration = this.animation[this.animationState.type.replace('-', '') + 'Duration'];
        const progress = Math.min(elapsed / duration, 1);
        
        // アニメーション効果を適用
        this.applyAnimationEffect(context, layout, progress);
        
        // アニメーション完了チェック
        if (progress >= 1) {
            this.animationState.isAnimating = false;
        }
    }
    
    /**
     * アニメーション効果を適用
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} layout - レイアウト情報
     * @param {number} progress - アニメーション進行度(0-1)
     */
    applyAnimationEffect(context, layout, progress) {
        const { type } = this.animationState;
        
        if (type === 'fade-in') {
            context.globalAlpha = progress;
        } else if (type === 'fade-out') {
            context.globalAlpha = 1 - progress;
        } else if (type === 'scale-in') {
            const scale = 0.8 + (0.2 * progress);
            const centerX = layout.x + layout.width / 2;
            const centerY = layout.y + layout.height / 2;
            
            context.save();
            context.translate(centerX, centerY);
            context.scale(scale, scale);
            context.translate(-centerX, -centerY);
        }
    }
    
    /**
     * アニメーション完了を待機
     * @returns {Promise} - アニメーション完了のPromise
     */
    waitForAnimation() {
        if (!this.animationState.isAnimating) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            const checkComplete = () => {
                if (!this.animationState.isAnimating) {
                    resolve();
                } else {
                    requestAnimationFrame(checkComplete);
                }
            };
            checkComplete();
        });
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
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // 状態変更の監視
        this.state.onChange('accessibilitySettings', (newSettings) => {
            this.animation.enabled = !newSettings.reducedMotion;
        });
        
        // エラーイベントの監視
        this.eventBus.on('component-error', (error) => {
            if (error.component === 'dialog') {
                this.handleError('component-error', error.error);
            }
        });
    }
    
    /**
     * エラーハンドリング
     * @param {string} operation - 操作名
     * @param {Error} error - エラーオブジェクト
     */
    handleError(operation, error) {
        console.error(`DialogManager ${operation} error:`, error);
        
        // エラーイベントを発火
        this.eventBus.emit('component-error', {
            component: 'DialogManager',
            operation,
            error
        });
        
        // 重大なエラーの場合はダイアログを強制終了
        if (operation === 'render' || operation === 'showDialog') {
            this.state.set('showingDialog', null, false);
            this.state.set('dialogData', {}, false);
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.dialogs.clear();
        this.dialogStack = [];
        this.animationState.isAnimating = false;
    }
}