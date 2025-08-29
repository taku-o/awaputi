/**
 * タブコンポーネントのベースクラス
 * UserInfoSceneのタブ機能を分離するための基底クラス
 */
export class TabComponent {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // タブコンポーネントの基本プロパティ
        this.isActive = false;
        this.isInitialized = false;
        
        // エラーハンドリング
        this.errorHandler = gameEngine.errorHandler;
        
        // アクセシビリティ設定
        this.accessibilitySettings = state.accessibilitySettings || {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
    }
    
    /**
     * コンポーネントの初期化
     * 子クラスでオーバーライドして実装
     */
    initialize() {
        this.isInitialized = true;
    }
    
    /**
     * タブがアクティブになった時の処理
     */
    activate() {
        this.isActive = true;
        if (!this.isInitialized) {
            this.initialize();
        }
    }
    
    /**
     * タブが非アクティブになった時の処理
     */
    deactivate() {
        this.isActive = false;
    }
    
    /**
     * レンダリング処理
     * 子クラスで必ずオーバーライドすること
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    render(context, x, y, width, height) {
        throw new Error('TabComponent.render() must be implemented by subclass');
    }
    
    /**
     * クリックイベント処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {boolean} - イベントが処理された場合true
     */
    handleClick(x, y) {
        return false;
    }
    
    /**
     * 入力イベント処理
     * @param {Event} event - 入力イベント
     * @returns {boolean} - イベントが処理された場合true
     */
    handleInput(event) {
        return false;
    }
    
    /**
     * フレーム更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 基本実装では何もしない
        // 必要に応じて子クラスでオーバーライド
    }
    
    /**
     * エラー発生時のフォールバック描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     * @param {Error} error - 発生したエラー
     */
    renderErrorFallback(context, x, y, width, height, error) {
        // エラーメッセージを表示
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FF0000' : '#FF6B6B';
        context.fillRect(x, y, width, height);
        
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#333333';
        context.font = this.accessibilitySettings.largeText ? '18px sans-serif' : '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const errorText = 'コンポーネントの読み込みでエラーが発生しました';
        context.fillText(errorText, x + width / 2, y + height / 2);
        
        // デバッグ情報（開発時のみ）
        if (this.gameEngine.debugMode) {
            context.font = '12px monospace';
            context.fillText(error.message, x + width / 2, y + height / 2 + 30);
        }
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup() {
        this.isActive = false;
        this.isInitialized = false;
    }
}