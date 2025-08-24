/**
 * 設定変更通知システム
 * 設定変更時の自動通知とコンポーネント監視機能を提供
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * リスナー情報の型定義
 */
interface ListenerInfo {
    id: string;
    callback: (newValue: any, oldValue: any, settingKey: string) => void;
    options: {
        immediate: boolean;
        debounce: number;
        priority: 'high' | 'normal' | 'low';
        context: string;
    };
    addedAt: number;
    callCount: number;
    lastCalled: number | null;
    debounceTimer?: NodeJS.Timeout;
}

/**
 * 監視情報の型定義
 */
interface WatcherInfo {
    id: string;
    componentName: string;
    component: any;
    watchedSettings: string[];
    addedAt: number;
    updateCount: number;
    lastUpdated: number | null;
    isActive: boolean;
}

/**
 * 通知情報の型定義
 */
interface NotificationInfo {
    id: string;
    settingKey: string;
    newValue: any;
    oldValue: any;
    metadata: any;
    timestamp: number;
    processed: boolean;
    listeners: Array<{
        id: string;
        context: string;
        success: boolean;
        error?: string;
    }>;
}

/**
 * 統計情報の型定義
 */
interface Stats {
    totalNotifications: number;
    successfulNotifications: number;
    failedNotifications: number;
    componentUpdates: number;
}

/**
 * 設定変更通知システムクラス
 */
export class SettingsNotificationSystem {
    private listeners: Map<string, Map<string, ListenerInfo>>;
    private componentWatchers: Map<string, WatcherInfo>;
    private notificationHistory: NotificationInfo[];
    private stats: Stats;
    private debugMode: boolean;

    constructor() {
        // 通知リスナー
        this.listeners = new Map();
        
        // コンポーネント監視
        this.componentWatchers = new Map();
        
        // 通知履歴
        this.notificationHistory = [];
        
        // 通知統計
        this.stats = {
            totalNotifications: 0,
            successfulNotifications: 0,
            failedNotifications: 0,
            componentUpdates: 0
        };
        
        // デバッグモード
        this.debugMode = this._isDebugMode();
        this._logDebug('SettingsNotificationSystem initialized');
    }
    
    /**
     * 設定変更リスナーを追加
     * @param {string} settingKey - 監視する設定キー
     * @param {Function} callback - コールバック関数
     * @param {Object} options - オプション
     * @returns {string} リスナーID
     */
    addListener(settingKey: string, callback: (newValue: any, oldValue: any, settingKey: string) => void, options: Partial<ListenerInfo['options']> = {}): string | null {
        try {
            const listenerId = this._generateListenerId();

            if (!this.listeners.has(settingKey)) {
                this.listeners.set(settingKey, new Map());
            }
            
            const listenerInfo: ListenerInfo = {
                id: listenerId,
                callback,
                options: {
                    immediate: options.immediate || false,
                    debounce: options.debounce || 0,
                    priority: options.priority || 'normal',
                    context: options.context || 'unknown'
                },
                addedAt: Date.now(),
                callCount: 0,
                lastCalled: null
            };
            
            this.listeners.get(settingKey)!.set(listenerId, listenerInfo);
            
            this._logDebug(`Listener added: ${settingKey} (ID: ${listenerId})`);
            return listenerId;

        } catch (error) {
            getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                operation: 'addListener',
                settingKey,
                options
            });
            return null;
        }
    }
    
    /**
     * 設定変更リスナーを削除
     * @param {string} listenerId - リスナーID
     * @returns {boolean} 削除成功フラグ
     */
    removeListener(listenerId: string): boolean {
        try {
            for (const [settingKey, listeners] of Array.from(this.listeners.entries())) {
                if (listeners.has(listenerId)) {
                    listeners.delete(listenerId);
                    // 空になったら削除
                    if (listeners.size === 0) {
                        this.listeners.delete(settingKey);
                    }
                    
                    this._logDebug(`Listener removed: ${settingKey} (ID: ${listenerId})`);
                    return true;
                }
            }
            
            this._logWarning(`Listener not found: ${listenerId}`);
            return false;

        } catch (error) {
            getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                operation: 'removeListener',
                listenerId
            });
            return false;
        }
    }
    
    /**
     * コンポーネント監視を追加
     * @param {string} componentName - コンポーネント名
     * @param {Object} component - コンポーネントオブジェクト
     * @param {Array} watchedSettings - 監視する設定のリスト
     * @returns {string} 監視ID
     */
    addComponentWatcher(componentName: string, component: any, watchedSettings: string[]): string | null {
        try {
            const watcherId = this._generateWatcherId();
            const watcherInfo: WatcherInfo = {
                id: watcherId,
                componentName,
                component,
                watchedSettings: [...watchedSettings],
                addedAt: Date.now(),
                updateCount: 0,
                lastUpdated: null,
                isActive: true
            };
            
            this.componentWatchers.set(watcherId, watcherInfo);
            
            // 各設定に対してリスナーを追加
            for (const settingKey of watchedSettings) {
                this.addListener(settingKey, (newValue, oldValue) => {
                    this._updateComponent(watcherId, settingKey, newValue, oldValue);
                }, {
                    context: `component:${componentName}`,
                    priority: 'high'
                });
            }
            
            this._logDebug(`Component watcher added: ${componentName} (ID: ${watcherId})`);
            return watcherId;

        } catch (error) {
            getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                operation: 'addComponentWatcher',
                componentName,
                watchedSettings
            });
            return null;
        }
    }
    
    /**
     * コンポーネント監視を削除
     * @param {string} watcherId - 監視ID
     * @returns {boolean} 削除成功フラグ
     */
    removeComponentWatcher(watcherId: string): boolean {
        try {
            if (this.componentWatchers.has(watcherId)) {
                const watcherInfo = this.componentWatchers.get(watcherId)!;
                watcherInfo.isActive = false;
                
                this.componentWatchers.delete(watcherId);
                this._logDebug(`Component watcher removed: ${watcherInfo.componentName} (ID: ${watcherId})`);
                return true;
            }
            
            this._logWarning(`Component watcher not found: ${watcherId}`);
            return false;

        } catch (error) {
            getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                operation: 'removeComponentWatcher',
                watcherId
            });
            return false;
        }
    }
    
    /**
     * 設定変更を通知
     * @param {string} settingKey - 設定キー
     * @param {*} newValue - 新しい値
     * @param {*} oldValue - 古い値
     * @param {Object} metadata - メタデータ
     */
    notifyChange(settingKey: string, newValue: any, oldValue: any, metadata: any = {}): void {
        try {
            this.stats.totalNotifications++;
            
            const notification: NotificationInfo = {
                id: this._generateNotificationId(),
                settingKey,
                newValue,
                oldValue,
                metadata,
                timestamp: Date.now(),
                processed: false,
                listeners: []
            };
            
            // 通知履歴に追加
            this.notificationHistory.push(notification);
            this._trimNotificationHistory();
            
            // リスナーに通知
            this._notifyListeners(settingKey, newValue, oldValue, notification);
            
            // ワイルドカードリスナーに通知
            this._notifyListeners('*', newValue, oldValue, notification);
            
            notification.processed = true;
            
            this._logDebug(`Setting change notified: ${settingKey} = ${newValue}`);

        } catch (error) {
            this.stats.failedNotifications++;
            getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                operation: 'notifyChange',
                settingKey,
                newValue,
                oldValue
            });
        }
    }
    
    /**
     * リスナーに通知
     * @private
     */
    private _notifyListeners(settingKey: string, newValue: any, oldValue: any, notification: NotificationInfo): void {
        if (!this.listeners.has(settingKey)) {
            return;
        }
        
        const listeners = this.listeners.get(settingKey)!;
        const sortedListeners = this._sortListenersByPriority(Array.from(listeners.values()));
        
        for (const listenerInfo of sortedListeners) {
            try {
                // デバウンス処理
                if (listenerInfo.options.debounce > 0) {
                    this._debounceCallback(listenerInfo, newValue, oldValue, settingKey);
                } else {
                    this._executeCallback(listenerInfo, newValue, oldValue, settingKey);
                }
                
                notification.listeners.push({
                    id: listenerInfo.id,
                    context: listenerInfo.options.context,
                    success: true
                });
            } catch (error: any) {
                notification.listeners.push({
                    id: listenerInfo.id,
                    context: listenerInfo.options.context,
                    success: false,
                    error: error.message
                });

                getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                    operation: '_notifyListeners',
                    listenerId: listenerInfo.id,
                    settingKey
                });
            }
        }
    }
    
    /**
     * コールバックを実行
     * @private
     */
    private _executeCallback(listenerInfo: ListenerInfo, newValue: any, oldValue: any, settingKey: string): void {
        listenerInfo.callback(newValue, oldValue, settingKey);
        listenerInfo.callCount++;
        listenerInfo.lastCalled = Date.now();
        this.stats.successfulNotifications++;
    }
    
    /**
     * デバウンス処理
     * @private
     */
    private _debounceCallback(listenerInfo: ListenerInfo, newValue: any, oldValue: any, settingKey: string): void {
        if (listenerInfo.debounceTimer) {
            clearTimeout(listenerInfo.debounceTimer);
        }
        
        listenerInfo.debounceTimer = setTimeout(() => {
            this._executeCallback(listenerInfo, newValue, oldValue, settingKey);
            listenerInfo.debounceTimer = undefined;
        }, listenerInfo.options.debounce);
    }
    
    /**
     * コンポーネントを更新
     * @private
     */
    private _updateComponent(watcherId: string, settingKey: string, newValue: any, oldValue: any): void {
        try {
            if (!this.componentWatchers.has(watcherId)) {
                return;
            }
            
            const watcherInfo = this.componentWatchers.get(watcherId)!;

            if (!watcherInfo.isActive) {
                return;
            }
            
            const { component, componentName } = watcherInfo;
            
            // コンポーネントの更新メソッドを呼び出し
            if (typeof component.onSettingChange === 'function') {
                component.onSettingChange(settingKey, newValue, oldValue);
            } else if (typeof component.updateSetting === 'function') {
                component.updateSetting(settingKey, newValue);
            } else {
                // 設定キーに基づいて適切なメソッドを呼び出し
                this._callComponentMethod(component, settingKey, newValue);
            }
            
            watcherInfo.updateCount++;
            watcherInfo.lastUpdated = Date.now();
            this.stats.componentUpdates++;
            
            this._logDebug(`Component updated: ${componentName}.${settingKey} = ${newValue}`);

        } catch (error) {
            getErrorHandler().handleError(error, 'NOTIFICATION_ERROR', {
                operation: '_updateComponent',
                watcherId,
                settingKey,
                newValue
            });
        }
    }
    
    /**
     * コンポーネントメソッドを呼び出し
     * @private
     */
    private _callComponentMethod(component: any, settingKey: string, newValue: any): void {
        // 設定キーに基づいてメソッド名を推測
        const methodMappings: { [key: string]: string } = {
            'masterVolume': 'setMasterVolume',
            'sfxVolume': 'setSfxVolume',
            'bgmVolume': 'setBgmVolume',
            'language': 'setLanguage',
            'quality': 'setQuality',
            'accessibility.highContrast': 'setHighContrast',
            'accessibility.reducedMotion': 'setReducedMotion'
        };
        
        const methodName = methodMappings[settingKey];

        if (methodName && typeof component[methodName] === 'function') {
            component[methodName](newValue);
        } else {
            // 汎用的な設定メソッド
            if (typeof component.setSetting === 'function') {
                component.setSetting(settingKey, newValue);
            }
        }
    }
    
    /**
     * リスナーを優先度でソート
     * @private
     */
    private _sortListenersByPriority(listeners: ListenerInfo[]): ListenerInfo[] {
        const priorityOrder: { [key: string]: number } = { 'high': 3, 'normal': 2, 'low': 1 };
        
        return listeners.sort((a, b) => {
            const aPriority = priorityOrder[a.options.priority] || 2;
            const bPriority = priorityOrder[b.options.priority] || 2;
            return bPriority - aPriority;
        });
    }
    
    /**
     * 通知履歴をトリム
     * @private
     */
    private _trimNotificationHistory(): void {
        const maxHistory = 100;
        if (this.notificationHistory.length > maxHistory) {
            this.notificationHistory.splice(0, this.notificationHistory.length - maxHistory);
        }
    }
    
    /**
     * リスナーIDを生成
     * @private
     */
    private _generateListenerId(): string {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 監視IDを生成
     * @private
     */
    private _generateWatcherId(): string {
        return `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 通知IDを生成
     * @private
     */
    private _generateNotificationId(): string {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats(): Stats & { activeListeners: number; activeWatchers: number; notificationHistorySize: number } {
        return {
            ...this.stats,
            activeListeners: Array.from(this.listeners.values()).reduce((sum, listeners) => sum + listeners.size, 0),
            activeWatchers: this.componentWatchers.size,
            notificationHistorySize: this.notificationHistory.length
        };
    }
    
    /**
     * 通知履歴を取得
     * @param {number} limit - 取得する履歴の数
     * @returns {Array} 通知履歴
     */
    getNotificationHistory(limit: number = 50): NotificationInfo[] {
        return this.notificationHistory.slice(-limit);
    }
    
    /**
     * アクティブなリスナー情報を取得
     * @returns {Object} リスナー情報
     */
    getActiveListeners(): { [key: string]: any[] } {
        const result: { [key: string]: any[] } = {};
        
        for (const [settingKey, listeners] of Array.from(this.listeners.entries())) {
            result[settingKey] = Array.from(listeners.values()).map((listener: ListenerInfo) => ({
                id: listener.id,
                context: listener.options.context,
                priority: listener.options.priority,
                callCount: listener.callCount,
                lastCalled: listener.lastCalled,
                addedAt: listener.addedAt
            }));
        }
        
        return result;
    }
    
    /**
     * アクティブなコンポーネント監視情報を取得
     * @returns {Array} 監視情報
     */
    getActiveWatchers(): any[] {
        return Array.from(this.componentWatchers.values()).map(watcher => ({
            id: watcher.id,
            componentName: watcher.componentName,
            watchedSettings: watcher.watchedSettings,
            updateCount: watcher.updateCount,
            lastUpdated: watcher.lastUpdated,
            addedAt: watcher.addedAt,
            isActive: watcher.isActive
        }));
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        // デバウンスタイマーをクリア
        for (const listeners of Array.from(this.listeners.values())) {
            for (const listener of Array.from(listeners.values())) {
                if (listener.debounceTimer) {
                    clearTimeout(listener.debounceTimer);
                }
            }
        }

        this.listeners.clear();
        this.componentWatchers.clear();
        this._logDebug('SettingsNotificationSystem cleaned up');
    }
    
    /**
     * デバッグモード判定
     * @private
     */
    private _isDebugMode(): boolean {
        try {
            if (typeof window !== 'undefined' && window.location) {
                return new URLSearchParams(window.location.search).has('debug') ||
                       (typeof localStorage !== 'undefined' && localStorage.getItem('debugMode') === 'true');
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * デバッグログ出力
     * @private
     */
    private _logDebug(message: string): void {
        if (this.debugMode) {
            console.log(`[SettingsNotificationSystem] ${message}`);
        }
    }
    
    /**
     * 警告ログ出力
     * @private
     */
    private _logWarning(message: string): void {
        console.warn(`[SettingsNotificationSystem] ${message}`);
    }
}

// シングルトンインスタンス
let instance: SettingsNotificationSystem | null = null;

/**
 * SettingsNotificationSystemのシングルトンインスタンスを取得
 * @returns {SettingsNotificationSystem} インスタンス
 */
export function getSettingsNotificationSystem(): SettingsNotificationSystem {
    if (!instance) {
        instance = new SettingsNotificationSystem();
    }
    return instance;
}