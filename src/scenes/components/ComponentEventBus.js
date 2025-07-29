/**
 * コンポーネント間通信用のイベントバス
 * UserInfoSceneのコンポーネント間でイベントを管理
 */
export class ComponentEventBus {
    constructor() {
        // イベントリスナーの管理
        this.listeners = new Map();
        
        // デバッグ用のイベント履歴
        this.eventHistory = [];
        this.maxHistorySize = 100;
        
        // エラーハンドリング
        this.errorHandlers = [];
    }
    
    /**
     * イベントリスナーを登録
     * @param {string} event - イベント名
     * @param {Function} callback - コールバック関数
     * @param {Object} options - オプション設定
     * @returns {Function} - リスナー削除用の関数
     */
    on(event, callback, options = {}) {
        if (typeof event !== 'string' || typeof callback !== 'function') {
            throw new Error('Invalid event or callback');
        }
        
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        const listenerInfo = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: this.generateListenerId()
        };
        
        this.listeners.get(event).push(listenerInfo);
        
        // 優先度順でソート
        this.listeners.get(event).sort((a, b) => b.priority - a.priority);
        
        // リスナー削除用の関数を返す
        return () => this.off(event, listenerInfo.id);
    }
    
    /**
     * 一度だけ実行されるイベントリスナーを登録
     * @param {string} event - イベント名
     * @param {Function} callback - コールバック関数
     * @returns {Function} - リスナー削除用の関数
     */
    once(event, callback) {
        return this.on(event, callback, { once: true });
    }
    
    /**
     * イベントリスナーを削除
     * @param {string} event - イベント名
     * @param {string|Function} callbackOrId - コールバック関数またはリスナーID
     */
    off(event, callbackOrId) {
        if (!this.listeners.has(event)) {
            return;
        }
        
        const listeners = this.listeners.get(event);
        const index = listeners.findIndex(listener => 
            listener.callback === callbackOrId || listener.id === callbackOrId
        );
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            // リスナーが空になった場合はイベント自体を削除
            if (listeners.length === 0) {
                this.listeners.delete(event);
            }
        }
    }
    
    /**
     * イベントを発火
     * @param {string} event - イベント名
     * @param {*} data - イベントデータ
     * @returns {boolean} - いずれかのリスナーがイベントを処理した場合true
     */
    emit(event, data) {
        try {
            // イベント履歴に記録
            this.addToHistory(event, data);
            
            if (!this.listeners.has(event)) {
                return false;
            }
            
            const listeners = this.listeners.get(event);
            let handled = false;
            const toRemove = [];
            
            for (const listener of listeners) {
                try {
                    const result = listener.callback(data, event);
                    if (result === true) {
                        handled = true;
                    }
                    
                    // onceリスナーの場合は削除対象にマーク
                    if (listener.once) {
                        toRemove.push(listener.id);
                    }
                } catch (error) {
                    this.handleListenerError(error, event, listener);
                }
            }
            
            // onceリスナーを削除
            for (const id of toRemove) {
                this.off(event, id);
            }
            
            return handled;
        } catch (error) {
            this.handleEmitError(error, event, data);
            return false;
        }
    }
    
    /**
     * すべてのリスナーを削除
     * @param {string} event - 特定のイベント名（省略時は全イベント）
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
    
    /**
     * 登録されているイベントの一覧を取得
     * @returns {Array<string>} - イベント名の配列
     */
    getEventNames() {
        return Array.from(this.listeners.keys());
    }
    
    /**
     * 特定のイベントのリスナー数を取得
     * @param {string} event - イベント名
     * @returns {number} - リスナー数
     */
    getListenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }
    
    /**
     * エラーハンドラーを登録
     * @param {Function} handler - エラーハンドラー関数
     */
    onError(handler) {
        if (typeof handler === 'function') {
            this.errorHandlers.push(handler);
        }
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} - デバッグ情報
     */
    getDebugInfo() {
        return {
            eventNames: this.getEventNames(),
            listenerCounts: Object.fromEntries(
                this.getEventNames().map(event => [event, this.getListenerCount(event)])
            ),
            recentEvents: this.eventHistory.slice(-10),
            totalEvents: this.eventHistory.length
        };
    }
    
    /**
     * リスナーIDを生成
     * @returns {string} - ユニークなリスナーID
     */
    generateListenerId() {
        return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * イベント履歴に追加
     * @param {string} event - イベント名
     * @param {*} data - イベントデータ
     */
    addToHistory(event, data) {
        this.eventHistory.push({
            event,
            data: this.safeClone(data),
            timestamp: Date.now()
        });
        
        // 履歴サイズを制限
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }
    
    /**
     * リスナーエラーを処理
     * @param {Error} error - 発生したエラー
     * @param {string} event - イベント名
     * @param {Object} listener - リスナー情報
     */
    handleListenerError(error, event, listener) {
        const errorInfo = {
            type: 'listener_error',
            error,
            event,
            listenerId: listener.id,
            timestamp: Date.now()
        };
        
        // エラーハンドラーに通知
        for (const handler of this.errorHandlers) {
            try {
                handler(errorInfo);
            } catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        }
        
        console.error(`EventBus listener error in event '${event}':`, error);
    }
    
    /**
     * イベント発火エラーを処理
     * @param {Error} error - 発生したエラー
     * @param {string} event - イベント名
     * @param {*} data - イベントデータ
     */
    handleEmitError(error, event, data) {
        const errorInfo = {
            type: 'emit_error',
            error,
            event,
            data: this.safeClone(data),
            timestamp: Date.now()
        };
        
        // エラーハンドラーに通知
        for (const handler of this.errorHandlers) {
            try {
                handler(errorInfo);
            } catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        }
        
        console.error(`EventBus emit error for event '${event}':`, error);
    }
    
    /**
     * オブジェクトの安全なクローンを作成
     * @param {*} obj - クローン対象
     * @returns {*} - クローンされたオブジェクト
     */
    safeClone(obj) {
        try {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            return '[Uncloneable Object]';
        }
    }
    
    /**
     * EventBusのクリーンアップ
     */
    cleanup() {
        this.removeAllListeners();
        this.eventHistory = [];
        this.errorHandlers = [];
    }
}