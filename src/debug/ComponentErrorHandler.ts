/**
 * ComponentErrorHandler - 分割コンポーネント用のエラーハンドリングシステム
 */

interface RecoverableError extends Error {
    recoverable?: boolean;
}

type FallbackFunction = () => any;

interface FallbackMap {
    [key: string]: FallbackFunction;
}

export class ComponentErrorHandler {
    /**
     * コンポーネントエラーの処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} component - コンポーネント名
     * @param {string} context - エラーコンテキスト
     * @returns {*} 回復処理の結果またはフォールバック値
     */
    static handleComponentError(error: Error, component: string, context: string): any {
        // エラーをコンテキスト付きでログ出力
        console.error(`[${component}] Error in ${context}:`, error);
        
        // 回復可能性の確認
        if (this.canRecover(error, component)) {
            return this.attemptRecovery(error, component);
        }
        
        // 優雅な劣化
        return this.gracefulDegradation(component);
    }
    
    /**
     * エラーが回復可能かどうかを判定
     * @param {Error} error - エラーオブジェクト
     * @param {string} component - コンポーネント名
     * @returns {boolean}
     */
    static canRecover(error: Error | RecoverableError, component: string): boolean {
        // ネットワークエラーや一時的な問題は回復可能
        const recoverableError = error as RecoverableError;
        if (recoverableError.recoverable !== false &&
            (error.name === 'NetworkError' || 
             error.name === 'TimeoutError' ||
             error.message.includes('temporary'))) {
            return true;
        }
        
        return false;
    }
    
    /**
     * エラー回復の試行
     * @param {Error} error - エラーオブジェクト
     * @param {string} component - コンポーネント名
     * @returns {*} 回復処理の結果
     */
    static attemptRecovery(error: Error, component: string): { status: string; message: string } | null {
        console.warn(`[${component}] Attempting recovery from ${error.name}`);
        
        // 基本的な回復処理
        if (error.name === 'NetworkError') {
            return { status: 'offline', message: 'Operating in offline mode' };
        }
        
        if (error.name === 'TimeoutError') {
            return { status: 'retry', message: 'Will retry operation' };
        }
        
        return null;
    }
    
    /**
     * 優雅な劣化処理
     * @param {string} component - コンポーネント名
     * @returns {*} フォールバック実装
     */
    static gracefulDegradation(component: string): any {
        console.warn(`[${component}] Providing fallback functionality`);
        
        // コンポーネントタイプに応じたフォールバック処理
        const fallbacks: FallbackMap = {
            'MockDataGenerator': () => ({}),
            'DebugInterface': () => ({ render: () => {} }),
            'TestSupport': () => ({ execute: () => true }),
            'default': () => null
        };
        
        const fallbackKey = Object.keys(fallbacks).find(key => 
            component.includes(key)) || 'default';
        
        return fallbacks[fallbackKey]();
    }
}