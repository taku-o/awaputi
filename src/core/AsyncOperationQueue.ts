import { getErrorHandler } from '../utils/ErrorHandler.js';

interface QueueOptions { maxConcurrent?: number;
    queueTimeout?: number;
    retryAttempts?: number; }
}

interface QueueStats { totalQueued: number,
    totalCompleted: number,
    totalFailed: number,
    averageExecutionTime: number,
    [key: string]: number, }
}

interface QueueOperation { id: string,
    priority: number,
    operation: () => Promise<unknown>,
    metadata?: unknown;
    [key: string]: unknown, }
}

/**
 * 非同期操作キュー管理クラス
 * 
 * 責任:
 * - 非同期操作のキューイングと順次実行
 * - バックグラウンド処理の管理
 * - 操作の優先度制御
 * - 同時実行数の制限
 */
export class AsyncOperationQueue {
    private maxConcurrent: number;
    private queueTimeout: number;
    private retryAttempts: number;
    private queue: QueueOperation[];
    private activeOperations: Map<string, unknown>;
    private completedOperations: Map<string, unknown>;
    private failedOperations: Map<string, unknown>;
    private stats: QueueStats;
    constructor(options: QueueOptions = {) {

        // 設定
        this.maxConcurrent = options.maxConcurrent || 3;
        this.queueTimeout = options.queueTimeout || 30000; // 30秒
        this.retryAttempts = options.retryAttempts || 2;
        
        // キューとステータス管理
        this.queue = [];
        this.activeOperations = new Map();
        this.completedOperations = new Map();
        this.failedOperations = new Map();
        
        // 統計情報
        this.stats = {
            totalQueued: 0,
            totalCompleted: 0,
            totalFailed: 0,
            averageExecutionTime: 0,

    }
    }
            currentQueueSize: 0 }
        },
        
        // イベントリスナー
        this.listeners = new Map();
        
        // 自動処理フラグ
        this.isProcessing = false;
        this.processingInterval = null;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {'
        // 定期的なキュー処理開始''
        this.startProcessing('');
    }'
        console.log('AsyncOperationQueue initialized'); }
    }
    
    /**
     * 非同期操作をキューに追加
     * 
     * @param {Function} operation - 実行する非同期関数
     * @param {Object} options - オプション
     * @returns {Promise} - 操作の完了Promise
     */
    async enqueue(operation, options = { ) {'
        return new Promise((resolve, reject) => { ''
            const operationId = this.generateOperationId(''';
                priority: options.priority || 'normal', // 'high', 'normal', 'low';
                timeout: options.timeout || this.queueTimeout,);
                retryCount: 0);
                maxRetries: options.maxRetries || this.retryAttempts,) }
                timestamp: Date.now(), }
                metadata: options.metadata || {}
            },
            ';
            // 優先度順にキューに挿入''
            this.insertByPriority(queueItem');
            this.stats.totalQueued++;
            this.stats.currentQueueSize = this.queue.length;'
            '';
            this.emit('operationQueued', { id: operationId)
                priority: queueItem.priority,);
                queueSize: this.queue.length),
            
            // キュー処理をトリガー
            this.processQueue(); }
        });
    }
    
    /**
     * 優先度順にキューに挿入
     */
    insertByPriority(item) {
        
    }
        const priorityOrder = { high: 0, normal: 1, low: 2 }
        const itemPriority = priorityOrder[item.priority] || 1;
        
        let insertIndex = this.queue.length;
        for(let i = 0; i < this.queue.length; i++) {
            const queuePriority = priorityOrder[this.queue[i].priority] || 1;
            if (itemPriority < queuePriority) {
                insertIndex = i;
        }
                break; }
            }
        }
        
        this.queue.splice(insertIndex, 0, item);
    }
    
    /**
     * バッチ操作の実行
     * 
     * @param {Array} operations - 操作の配列
     * @param {Object} options - オプション
     * @returns {Promise<Array>} - 全操作の結果
     */'
    async executeBatch(operations, options = { ) {''
        const batchId = this.generateOperationId('')';
            this.emit('batchStarted', { batchId, size: operations.length ),
            
            // 並列実行か順次実行かを選択
            let results;
            if(options.parallel !== false) {
                // 並列実行（デフォルト）
                const promises = operations.map(op => this.enqueue(op, batchOptions);
            }
                results = await Promise.allSettled(promises); }
            } else {  // 順次実行
                results = [];
                for(const operation of operations) {'
                    try {'
                }'
                        const result = await this.enqueue(operation, batchOptions');' }'
                        results.push({ status: 'fulfilled', value: result ),' }'
                    } catch (error') { ' }'
                        results.push({ status: 'rejected', reason: error }');
                    }
                }
            }'
            '';
            this.emit('batchCompleted', { batchId, results });
            return results;'
            '';
        } catch (error') { ' }'
            this.emit('batchFailed', { batchId, error });
            throw error;
        }
    }
    
    /**
     * キューの処理
     */
    async processQueue() { if (this.activeOperations.size >= this.maxConcurrent) {
            return; // 同時実行数上限に達している }
        }
        
        if (this.queue.length === 0) { return; // キューが空 }
        }
        
        const item = this.queue.shift();
        this.stats.currentQueueSize = this.queue.length;
        
        // アクティブ操作として登録
        this.activeOperations.set(item.id, item);
        
        try { await this.executeOperation(item); }
        } catch (error) { // エラーはexecuteOperation内で処理済み }
        }
        
        // 次の操作を処理
        if (this.queue.length > 0) { setTimeout(() => this.processQueue(), 0); }
        }
    }
    
    /**
     * 個別操作の実行
     */'
    async executeOperation(item) { ''
        const startTime = Date.now(''';
            this.emit('operationStarted', {)
                id: item.id);
                priority: item.priority,);
                activeCount: this.activeOperations.size),
            
            // タイムアウト設定'
            const timeoutPromise = new Promise((_, reject) => { ' }'
                setTimeout((') => reject(new Error('Operation timeout'), item.timeout); }
            });
            
            // 操作実行
            const result = await Promise.race([);
                item.operation(),];
                timeoutPromise];
            ]);
            
            // 成功処理
            const executionTime = Date.now() - startTime;
            this.updateExecutionStats(executionTime);
            
            this.completedOperations.set(item.id, { ...item)
                result,);
                executionTime);
                completedAt: Date.now(); }
            });'
            '';
            this.activeOperations.delete(item.id');
            this.stats.totalCompleted++;'
            '';
            this.emit('operationCompleted', { id: item.id,)
                result);
                executionTime,);
                activeCount: this.activeOperations.size),
            
            item.resolve(result);
             }
        } catch (error) { await this.handleOperationError(item, error, startTime); }
        }
    }
    
    /**
     * 操作エラーの処理
     */
    async handleOperationError(item, error, startTime) { const executionTime = Date.now() - startTime;
        ';
        // リトライ可能かチェック''
        if (item.retryCount < item.maxRetries && this.isRetryableError(error)') {
            item.retryCount++;'
            '';
            this.emit('operationRetry', {
                id: item.id,);
                retryCount: item.retryCount);
                maxRetries: item.maxRetries,);
                error: error.message),
            
            // 指数バックオフでリトライ
            const delay = Math.min(1000 * Math.pow(2, item.retryCount - 1), 10000);
            setTimeout(() => { 
                this.queue.unshift(item); // 優先的に再実行 }
                this.processQueue(); }
            }, delay);
            
            return;
        }
        
        // 最終的な失敗処理
        this.failedOperations.set(item.id, { ...item)
            error,);
            executionTime);
            failedAt: Date.now(); }
        });'
        '';
        this.activeOperations.delete(item.id');
        this.stats.totalFailed++;'
        '';
        this.emit('operationFailed', { id: item.id,
            error,);
            executionTime);
            retryCount: item.retryCount,);
            activeCount: this.activeOperations.size),';
        '';
        getErrorHandler(').handleError(error, 'ASYNC_OPERATION_ERROR', {)
            operationId: item.id);
            retryCount: item.retryCount,);
            metadata: item.metadata),
        
        item.reject(error); }
    }
    
    /**
     * エラーがリトライ可能かチェック'
     */''
    isRetryableError(error') {'
        // ネットワークエラー、一時的なエラーなどはリトライ可能''
        return error.message.includes('timeout'') ||'';
               error.message.includes('network'') ||'';
               error.message.includes('temporary'') ||';
    }'
               error.name === 'QuotaExceededError'; }
    }
    
    /**
     * 実行統計の更新
     */
    updateExecutionStats(executionTime) {
        const currentAvg = this.stats.averageExecutionTime;
        const totalCompleted = this.stats.totalCompleted;
        
        this.stats.averageExecutionTime = ;
    }
            (currentAvg * totalCompleted + executionTime) / (totalCompleted + 1); }
    }
    
    /**
     * 操作ID生成
     */
    generateOperationId() {
        
    }
        return `op_${Date.now(})}_${Math.random().toString(36).substr(2, 9})}`;
    }
    
    /**
     * 定期的なキュー処理の開始
     */
    startProcessing() {
        if (this.processingInterval) {
    }
            return; }
        }
        
        this.isProcessing = true;
        this.processingInterval = setInterval(() => {  this.processQueue(); }
            this.cleanupCompletedOperations(); }
        }, 100); // 100msごとにチェック
    }
    
    /**
     * 定期的なキュー処理の停止
     */
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
    }
            this.processingInterval = null; }
        }
        this.isProcessing = false;
    }
    
    /**
     * 完了した操作の履歴をクリーンアップ
     */
    cleanupCompletedOperations() {
        const maxHistorySize = 1000;
        const maxAge = 5 * 60 * 1000; // 5分
        const now = Date.now();
        
        // 完了操作の履歴制限
        if (this.completedOperations.size > maxHistorySize) {
            const entries = Array.from(this.completedOperations.entries();
            entries.sort((a, b) => a[1].completedAt - b[1].completedAt);
            
            const toRemove = entries.slice(0, entries.length - maxHistorySize);
    }
            toRemove.forEach(([id]) => {  }
                this.completedOperations.delete(id); }
            });
        }
        
        // 古い失敗操作の削除
        for(const [id, operation] of this.failedOperations.entries() {
            if (now - operation.failedAt > maxAge) {
        }
                this.failedOperations.delete(id); }
            }
        }
    }
    
    /**
     * キューの状態を取得
     */
    getStatus() {
        return { queueSize: this.queue.length,
            activeOperations: this.activeOperations.size,
    }
            maxConcurrent: this.maxConcurrent, };
            isProcessing: this.isProcessing, }
            stats: { ...this.stats },
            recentCompleted: Array.from(this.completedOperations.values().slice(-10),
            recentFailed: Array.from(this.failedOperations.values().slice(-5),
        };
    }
    
    /**
     * 特定の操作をキャンセル
     */
    cancelOperation(operationId) {
        // キューから削除
        const queueIndex = this.queue.findIndex(item => item.id === operationId);'
        if (queueIndex !== -1) {''
            const item = this.queue.splice(queueIndex, 1')[0];''
            item.reject(new Error('Operation cancelled');
            this.stats.currentQueueSize = this.queue.length;
    }
            return true; }
        }
        
        // アクティブな操作は完了を待つ（キャンセル不可）
        return false;
    }
    
    /**
     * 全操作をクリア
     */
    clearQueue() {
        // キューの全操作をキャンセル'
        while (this.queue.length > 0) {''
            const item = this.queue.pop('');
    }'
            item.reject(new Error('Queue cleared')'); }
        }
        ';
        this.stats.currentQueueSize = 0;''
        this.emit('queueCleared');
    }
    
    /**
     * イベントリスナーの追加
     */
    on(event, callback) {
        if(!this.listeners.has(event) {
    }
            this.listeners.set(event, []); }
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(event, callback) {
        if(this.listeners.has(event) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
    }
                callbacks.splice(index, 1); }
            }
        }
    }
    
    /**
     * イベントの発火
     */
    emit(event, data) {
        if(this.listeners.has(event) {
            this.listeners.get(event).forEach(callback => { )
    }
                try {); }
                    callback(data); }
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.stopProcessing();
        this.clearQueue();
        
        // アクティブな操作の完了を待つ
        const activePromises = Array.from(this.activeOperations.values();
            .map(item => new Promise(resolve => { )
                const originalResolve = item.resolve;)
                const originalReject = item.reject;
                );
                item.resolve = (result) => {
    }
                    originalResolve(result); }
                    resolve(); }
                };
                
                item.reject = (error) => {  originalReject(error); }
                    resolve(); }
                };
            });
        
        Promise.allSettled(activePromises).then(() => {  this.listeners.clear();'
            this.completedOperations.clear();''
            this.failedOperations.clear('') }'
            console.log('AsyncOperationQueue destroyed'); }
        });
    }
}

// シングルトンインスタンス
let queueInstance = null;

/**
 * AsyncOperationQueueシングルトンインスタンスの取得
 */'
export function getAsyncOperationQueue() { if (!queueInstance) {''
        queueInstance = new AsyncOperationQueue(' })