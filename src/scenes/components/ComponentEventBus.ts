// インターフェース定義
interface ListenerOptions { once?: boolean;
    priority?: number; }

interface ListenerInfo { callback: EventCallback,
    once: boolean;
    priority: number;
   , id: string ,}

interface EventHistoryEntry { event: string;
    data: any;
   , timestamp: number }

interface ErrorInfo { type: 'listener_error' | 'emit_error';
    error: Error;
    event: string;
    listenerId?: string;
    data?: any;
   , timestamp: number }

interface DebugInfo { eventNames: string[];
   , listenerCounts: Record<string, number>;
    recentEvents: EventHistoryEntry[];
   , totalEvents: number ,}

type EventCallback = (data: any, event: string) => boolean | void;
type ErrorHandler = (errorInfo: ErrorInfo) => void;
type UnsubscribeFunction = () => void;

/**
 * コンポーネント間通信用のイベントバス
 * UserInfoSceneのコンポーネント間でイベントを管理
 */
export class ComponentEventBus {
    // イベントリスナーの管理
    private listeners: Map<string, ListenerInfo[]>;
    
    // デバッグ用のイベント履歴
    private eventHistory: EventHistoryEntry[];
    private maxHistorySize: number;
    // エラーハンドリング
    private, errorHandlers: ErrorHandler[];
    constructor() {

        // イベントリスナーの管理
        this.listeners = new Map();
        
        // デバッグ用のイベント履歴
        this.eventHistory = [];
        this.maxHistorySize = 100;
        
        // エラーハンドリング

    ,}
        this.errorHandlers = []; }
    }
    
    /**
     * イベントリスナーを登録
     * @param event - イベント名
     * @param callback - コールバック関数
     * @param options - オプション設定
     * @returns リスナー削除用の関数
     */''
    on(event: string, callback: EventCallback, options: ListenerOptions = { )): UnsubscribeFunction {''
        if(typeof, event !== 'string' || typeof, callback !== 'function'') {', ';

        }

            throw new Error('Invalid, event or, callback); }'
        }
        
        if(!this.listeners.has(event) { this.listeners.set(event, []); }
        
        const listenerInfo: ListenerInfo = { callback,
            once: options.once || false;
            priority: options.priority || 0;
           , id: this.generateListenerId( ,};
        
        this.listeners.get(event)!.push(listenerInfo);
        
        // 優先度順でソート
        this.listeners.get(event)!.sort((a, b) => b.priority - a.priority);
        
        // リスナー削除用の関数を返す
        return () => this.off(event, listenerInfo.id);
    }
    
    /**
     * 一度だけ実行されるイベントリスナーを登録
     * @param event - イベント名
     * @param callback - コールバック関数
     * @returns リスナー削除用の関数
     */
    once(event: string, callback: EventCallback): UnsubscribeFunction { return this.on(event, callback, { once: true ,}
    
    /**
     * イベントリスナーを削除
     * @param event - イベント名
     * @param callbackOrId - コールバック関数またはリスナーID
     */
    off(event: string, callbackOrId: EventCallback | string): void { if(!this.listeners.has(event) {
            return; }
        
        const listeners = this.listeners.get(event)!;
        const index = listeners.findIndex(listener => );
            listener.callback === callbackOrId || listener.id === callbackOrId);
        
        if(index !== -1) {
        
            listeners.splice(index, 1);
            
            // リスナーが空になった場合はイベント自体を削除
            if (listeners.length === 0) {
        
        }
                this.listeners.delete(event); }
}
    }
    
    /**
     * イベントを発火
     * @param event - イベント名
     * @param data - イベントデータ
     * @returns いずれかのリスナーがイベントを処理した場合true
     */
    emit(event: string, data?: any): boolean { try {
            // イベント履歴に記録
            this.addToHistory(event, data);
            
            if(!this.listeners.has(event) {
            
                
            
            }
                return false;
            
            const listeners = this.listeners.get(event)!;
            let handled = false;
            const toRemove: string[] = [],
            
            for(const, listener of, listeners) {
            
                try {
                    const result = listener.callback(data, event);
                    if (result === true) {
            
            }
                        handled = true; }
                    }
                    
                    // onceリスナーの場合は削除対象にマーク
                    if (listener.once) { toRemove.push(listener.id); } catch (error) { this.handleListenerError(error as Error, event, listener); }
            }
            
            // onceリスナーを削除
            for (const, id of, toRemove) { this.off(event, id); }
            
            return handled;
        } catch (error) { this.handleEmitError(error as Error, event, data);
            return false;
    
    /**
     * すべてのリスナーを削除
     * @param event - 特定のイベント名（省略時は全イベント）
     */
    removeAllListeners(event?: string): void { if (event) {
            this.listeners.delete(event); } else { this.listeners.clear(); }
    }
    
    /**
     * 登録されているイベントの一覧を取得
     * @returns イベント名の配列
     */
    getEventNames(): string[] { return Array.from(this.listeners.keys(); }
    
    /**
     * 特定のイベントのリスナー数を取得
     * @param event - イベント名
     * @returns リスナー数
     */
    getListenerCount(event: string): number { return this.listeners.has(event) ? this.listeners.get(event)!.length: 0, 
    /**
     * エラーハンドラーを登録
     * @param handler - エラーハンドラー関数
     */''
    onError(handler: ErrorHandler): void { ''
        if(typeof, handler === 'function) {'
            
        ,}
            this.errorHandlers.push(handler);
    
    /**
     * デバッグ情報を取得
     * @returns デバッグ情報
     */
    getDebugInfo(): DebugInfo { return { eventNames: this.getEventNames()
           , listenerCounts: Object.fromEntries();
                this.getEventNames().map(event => [event, this.getListenerCount(event)]);
            ),
            recentEvents: this.eventHistory.slice(-10), };
            totalEvents: this.eventHistory.length }
        }
    
    /**
     * リスナーIDを生成
     * @returns ユニークなリスナーID'
     */''
    private generateListenerId()';
        return 'listener_' + Date.now(') + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * イベント履歴に追加
     * @param event - イベント名
     * @param data - イベントデータ
     */
    private addToHistory(event: string, data: any): void { this.eventHistory.push({)
            event);
            data: this.safeClone(data);
           , timestamp: Date.now( });
        
        // 履歴サイズを制限
        if (this.eventHistory.length > this.maxHistorySize) { this.eventHistory.shift(); }
    }
    
    /**
     * リスナーエラーを処理
     * @param error - 発生したエラー
     * @param event - イベント名
     * @param listener - リスナー情報
     */''
    private handleListenerError(error: Error, event: string, listener: ListenerInfo): void { const errorInfo: ErrorInfo = {''
            type: 'listener_error';
            error,
            event,
            listenerId: listener.id;
           , timestamp: Date.now( ,};
        
        // エラーハンドラーに通知
        for(const handler of this.errorHandlers) {
            try {
        }
                handler(errorInfo);' }'

            } catch (handlerError) { console.error('Error in error handler:', handlerError }
        }

        console.error(`EventBus listener error in event '${event}':`, error);
    }
    
    /**
     * イベント発火エラーを処理
     * @param error - 発生したエラー
     * @param event - イベント名
     * @param data - イベントデータ'
     */''
    private handleEmitError(error: Error, event: string, data: any): void { const errorInfo: ErrorInfo = {''
            type: 'emit_error';
            error,
            event,
            data: this.safeClone(data);
           , timestamp: Date.now( ,};
        
        // エラーハンドラーに通知
        for(const handler of this.errorHandlers) {
            try {
        }
                handler(errorInfo);' }'

            } catch (handlerError) { console.error('Error in error handler:', handlerError }
        }

        console.error(`EventBus emit error for event '${event}':`, error);
    }
    
    /**
     * オブジェクトの安全なクローンを作成
     * @param obj - クローン対象
     * @returns クローンされたオブジェクト'
     */''
    private safeClone(obj: any): any { try {'
            if(obj === null || typeof, obj !== 'object) {'
                
            }
                return obj;

            return JSON.parse(JSON.stringify(obj);''
        } catch (error) {
            return '[Uncloneable Object]';
    
    /**
     * EventBusのクリーンアップ
     */'
    cleanup(): void { ''
        this.removeAllListeners(' })'