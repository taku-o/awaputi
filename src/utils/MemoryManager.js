/**
 * メモリ管理システム
 * メモリリークの防止と効率的なメモリ使用のための機能を提供
 */
export class MemoryManager {
    constructor() {
        this.trackedObjects = new WeakMap();
        this.timers = new Set();
        this.eventListeners = new Map();
        this.canvasContexts = new Set();
        this.imageCache = new Map();
        this.audioCache = new Map();
        
        this.stats = {
            objectsCreated: 0,
            objectsDestroyed: 0,
            timersCreated: 0,
            timersCleared: 0,
            listenersAdded: 0,
            listenersRemoved: 0
        };
        
        // 定期的なクリーンアップ
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 30000); // 30秒ごと
        
        this.bindMethods();
    }
    
    /**
     * メソッドをバインド
     */
    bindMethods() {
        // オリジナルのsetTimeout/setIntervalを保存
        this.originalSetTimeout = window.setTimeout;
        this.originalSetInterval = window.setInterval;
        this.originalClearTimeout = window.clearTimeout;
        this.originalClearInterval = window.clearInterval;
        
        // ラップされたタイマー関数を作成
        window.setTimeout = this.wrappedSetTimeout.bind(this);
        window.setInterval = this.wrappedSetInterval.bind(this);
        window.clearTimeout = this.wrappedClearTimeout.bind(this);
        window.clearInterval = this.wrappedClearInterval.bind(this);
    }
    
    /**
     * ラップされたsetTimeout
     */
    wrappedSetTimeout(callback, delay, ...args) {
        const timerId = this.originalSetTimeout.call(window, () => {
            this.timers.delete(timerId);
            callback(...args);
        }, delay);
        
        this.timers.add(timerId);
        this.stats.timersCreated++;
        return timerId;
    }
    
    /**
     * ラップされたsetInterval
     */
    wrappedSetInterval(callback, delay, ...args) {
        const timerId = this.originalSetInterval.call(window, callback, delay, ...args);
        this.timers.add(timerId);
        this.stats.timersCreated++;
        return timerId;
    }
    
    /**
     * ラップされたclearTimeout
     */
    wrappedClearTimeout(timerId) {
        this.timers.delete(timerId);
        this.stats.timersCleared++;
        return this.originalClearTimeout.call(window, timerId);
    }
    
    /**
     * ラップされたclearInterval
     */
    wrappedClearInterval(timerId) {
        this.timers.delete(timerId);
        this.stats.timersCleared++;
        return this.originalClearInterval.call(window, timerId);
    }
    
    /**
     * オブジェクトを追跡
     * @param {object} obj - 追跡するオブジェクト
     * @param {string} type - オブジェクトタイプ
     */
    trackObject(obj, type = 'unknown') {
        this.trackedObjects.set(obj, {
            type: type,
            createdAt: Date.now(),
            size: this.estimateObjectSize(obj)
        });
        this.stats.objectsCreated++;
    }
    
    /**
     * オブジェクトの追跡を解除
     * @param {object} obj - 追跡解除するオブジェクト
     */
    untrackObject(obj) {
        if (this.trackedObjects.has(obj)) {
            this.trackedObjects.delete(obj);
            this.stats.objectsDestroyed++;
        }
    }
    
    /**
     * イベントリスナーを追加（追跡付き）
     * @param {Element} element - 要素
     * @param {string} event - イベント名
     * @param {Function} handler - ハンドラー
     * @param {object} options - オプション
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        const key = `${element.constructor.name}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        
        this.eventListeners.get(key).push({
            element: element,
            event: event,
            handler: handler,
            options: options
        });
        
        this.stats.listenersAdded++;
    }
    
    /**
     * イベントリスナーを削除
     * @param {Element} element - 要素
     * @param {string} event - イベント名
     * @param {Function} handler - ハンドラー
     */
    removeEventListener(element, event, handler) {
        element.removeEventListener(event, handler);
        
        const key = `${element.constructor.name}_${event}`;
        const listeners = this.eventListeners.get(key);
        
        if (listeners) {
            const index = listeners.findIndex(l => 
                l.element === element && 
                l.event === event && 
                l.handler === handler
            );
            
            if (index !== -1) {
                listeners.splice(index, 1);
                this.stats.listenersRemoved++;
                
                if (listeners.length === 0) {
                    this.eventListeners.delete(key);
                }
            }
        }
    }
    
    /**
     * すべてのイベントリスナーを削除
     */
    removeAllEventListeners() {
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
                this.stats.listenersRemoved++;
            });
        });
        
        this.eventListeners.clear();
    }
    
    /**
     * Canvasコンテキストを追跡
     * @param {CanvasRenderingContext2D} context - コンテキスト
     */
    trackCanvasContext(context) {
        this.canvasContexts.add(context);
    }
    
    /**
     * 画像をキャッシュ
     * @param {string} src - 画像ソース
     * @param {HTMLImageElement} image - 画像要素
     */
    cacheImage(src, image) {
        this.imageCache.set(src, {
            image: image,
            lastUsed: Date.now(),
            useCount: 1
        });
    }
    
    /**
     * キャッシュされた画像を取得
     * @param {string} src - 画像ソース
     * @returns {HTMLImageElement|null} 画像要素
     */
    getCachedImage(src) {
        const cached = this.imageCache.get(src);
        if (cached) {
            cached.lastUsed = Date.now();
            cached.useCount++;
            return cached.image;
        }
        return null;
    }
    
    /**
     * 音声をキャッシュ
     * @param {string} src - 音声ソース
     * @param {HTMLAudioElement} audio - 音声要素
     */
    cacheAudio(src, audio) {
        this.audioCache.set(src, {
            audio: audio,
            lastUsed: Date.now(),
            useCount: 1
        });
    }
    
    /**
     * キャッシュされた音声を取得
     * @param {string} src - 音声ソース
     * @returns {HTMLAudioElement|null} 音声要素
     */
    getCachedAudio(src) {
        const cached = this.audioCache.get(src);
        if (cached) {
            cached.lastUsed = Date.now();
            cached.useCount++;
            return cached.audio;
        }
        return null;
    }
    
    /**
     * オブジェクトサイズを推定
     * @param {object} obj - オブジェクト
     * @returns {number} 推定サイズ（バイト）
     */
    estimateObjectSize(obj) {
        if (obj === null || obj === undefined) return 0;
        
        const type = typeof obj;
        
        switch (type) {
            case 'boolean':
                return 1;
            case 'number':
                return 8;
            case 'string':
                return obj.length * 2; // UTF-16
            case 'object':
                if (Array.isArray(obj)) {
                    return obj.reduce((size, item) => size + this.estimateObjectSize(item), 0);
                } else {
                    return Object.keys(obj).reduce((size, key) => {
                        return size + this.estimateObjectSize(key) + this.estimateObjectSize(obj[key]);
                    }, 0);
                }
            default:
                return 0;
        }
    }
    
    /**
     * 定期的なクリーンアップを実行
     */
    performCleanup() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分
        
        // 古い画像キャッシュを削除
        this.imageCache.forEach((cached, src) => {
            if (now - cached.lastUsed > maxAge && cached.useCount < 5) {
                this.imageCache.delete(src);
            }
        });
        
        // 古い音声キャッシュを削除
        this.audioCache.forEach((cached, src) => {
            if (now - cached.lastUsed > maxAge && cached.useCount < 5) {
                cached.audio.pause();
                cached.audio.src = '';
                this.audioCache.delete(src);
            }
        });
        
        // ガベージコレクションの強制実行（利用可能な場合）
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('Memory cleanup performed');
    }
    
    /**
     * メモリ使用量を取得
     * @returns {object} メモリ情報
     */
    getMemoryUsage() {
        const info = {
            trackedObjects: this.stats.objectsCreated - this.stats.objectsDestroyed,
            activeTimers: this.timers.size,
            eventListeners: Array.from(this.eventListeners.values()).reduce((total, listeners) => total + listeners.length, 0),
            imageCache: this.imageCache.size,
            audioCache: this.audioCache.size,
            canvasContexts: this.canvasContexts.size
        };
        
        if (performance.memory) {
            info.jsHeapSize = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        
        return info;
    }
    
    /**
     * メモリリークの検出
     * @returns {string[]} 検出された問題
     */
    detectMemoryLeaks() {
        const issues = [];
        const usage = this.getMemoryUsage();
        
        if (usage.trackedObjects > 1000) {
            issues.push(`High number of tracked objects: ${usage.trackedObjects}`);
        }
        
        if (usage.activeTimers > 100) {
            issues.push(`High number of active timers: ${usage.activeTimers}`);
        }
        
        if (usage.eventListeners > 500) {
            issues.push(`High number of event listeners: ${usage.eventListeners}`);
        }
        
        if (usage.jsHeapSize && usage.jsHeapSize.used > usage.jsHeapSize.limit * 0.8) {
            issues.push(`High heap usage: ${usage.jsHeapSize.used}MB / ${usage.jsHeapSize.limit}MB`);
        }
        
        // タイマーのリーク検出
        const timerLeakThreshold = this.stats.timersCreated - this.stats.timersCleared;
        if (timerLeakThreshold > 50) {
            issues.push(`Potential timer leak: ${timerLeakThreshold} uncleaned timers`);
        }
        
        // イベントリスナーのリーク検出
        const listenerLeakThreshold = this.stats.listenersAdded - this.stats.listenersRemoved;
        if (listenerLeakThreshold > 100) {
            issues.push(`Potential listener leak: ${listenerLeakThreshold} unremoved listeners`);
        }
        
        return issues;
    }
    
    /**
     * 強制的なメモリクリーンアップ
     */
    forceCleanup() {
        // すべてのタイマーをクリア
        this.timers.forEach(timerId => {
            this.originalClearTimeout(timerId);
            this.originalClearInterval(timerId);
        });
        this.timers.clear();
        
        // すべてのイベントリスナーを削除
        this.removeAllEventListeners();
        
        // キャッシュをクリア
        this.imageCache.clear();
        this.audioCache.forEach(cached => {
            cached.audio.pause();
            cached.audio.src = '';
        });
        this.audioCache.clear();
        
        // Canvasコンテキストをクリア
        this.canvasContexts.forEach(context => {
            if (context.canvas) {
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            }
        });
        
        this.performCleanup();
        
        console.log('Force cleanup completed');
    }
    
    /**
     * 統計情報を取得
     * @returns {object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            memoryUsage: this.getMemoryUsage(),
            detectedIssues: this.detectMemoryLeaks()
        };
    }
    
    /**
     * メモリマネージャーを破棄
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.forceCleanup();
        
        // オリジナルの関数を復元
        window.setTimeout = this.originalSetTimeout;
        window.setInterval = this.originalSetInterval;
        window.clearTimeout = this.originalClearTimeout;
        window.clearInterval = this.originalClearInterval;
    }
}

/**
 * WeakRefを使用したリソース管理
 */
export class WeakResourceManager {
    constructor() {
        this.resources = new Map();
        this.registry = new FinalizationRegistry((key) => {
            console.log(`Resource ${key} was garbage collected`);
            this.resources.delete(key);
        });
    }
    
    /**
     * リソースを登録
     * @param {string} key - キー
     * @param {object} resource - リソース
     */
    register(key, resource) {
        const weakRef = new WeakRef(resource);
        this.resources.set(key, weakRef);
        this.registry.register(resource, key);
    }
    
    /**
     * リソースを取得
     * @param {string} key - キー
     * @returns {object|null} リソース
     */
    get(key) {
        const weakRef = this.resources.get(key);
        if (weakRef) {
            const resource = weakRef.deref();
            if (resource) {
                return resource;
            } else {
                this.resources.delete(key);
            }
        }
        return null;
    }
    
    /**
     * リソースを削除
     * @param {string} key - キー
     */
    delete(key) {
        this.resources.delete(key);
    }
    
    /**
     * 利用可能なリソース数を取得
     * @returns {number} リソース数
     */
    size() {
        // 生きているリソースのみをカウント
        let count = 0;
        this.resources.forEach((weakRef, key) => {
            if (weakRef.deref()) {
                count++;
            } else {
                this.resources.delete(key);
            }
        });
        return count;
    }
}

// グローバルインスタンス（遅延初期化）
let _memoryManager = null;

export function getMemoryManager() {
    if (!_memoryManager) {
        _memoryManager = new MemoryManager();
    }
    return _memoryManager;
}

// 後方互換性のため
export const memoryManager = getMemoryManager;