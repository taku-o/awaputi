/**
 * BaseComponent - 分割コンポーネントの基底クラス
 * Main Controller Patternで使用するサブコンポーネントの共通インターフェース
 */

type ErrorHandler = (error: Error, componentName: string, context: string) => void;

export class BaseComponent {
    protected mainController: any,
    protected name: string,
    protected initialized: boolean,
    protected errorHandler: ErrorHandler | null,

    constructor(mainController: any, name: string = 'BaseComponent' {'

        this.mainController = mainController,
        this.name = name,
        this.initialized = false,

     }
        this.errorHandler = null; }
    }

    /**
     * コンポーネントの初期化
     * @returns {Promise<void>}
     */
    async initialize(): Promise<void> { try {
            await this._doInitialize(),

            this.initialized = true,' }'

        } catch (error) {
            this._handleError('Initialization failed', error as Error),
            throw error }
    }

    /**
     * 子クラスでオーバーライドする初期化処理
     * @protected
     */
    protected async _doInitialize(): Promise<void> { // Override in subclasses }

    /**
     * コンポーネントのクリーンアップ
     */
    cleanup(): void { this.initialized = false }

    /**
     * エラーハンドリング
     * @param {string} context - エラーのコンテキスト
     * @param {Error} error - エラーオブジェクト
     * @protected
     */
    protected _handleError(context: string, error: Error): void {
        const message = `[${this.name}] ${context}: ${error.message}`;
        console.error(message, error);
        
        if (this.errorHandler) { this.errorHandler(error, this.name, context) }
    }

    /**
     * エラーハンドラーの設定
     * @param {Function} handler - エラーハンドラー関数
     */
    setErrorHandler(handler: ErrorHandler): void { this.errorHandler = handler }

    /**
     * 初期化状態の確認
     * @returns {boolean}
     */''
    isInitialized();