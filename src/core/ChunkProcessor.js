import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * チャンク処理クラス - 大量データの分割処理とメモリ効率化
 * 
 * 責任:
 * - 大量データの分割処理
 * - プログレッシブ処理の実装
 * - メモリ効率的なデータ処理
 * - 処理進捗の監視
 */
export class ChunkProcessor {
    constructor(options = {}) {
        // 設定
        this.defaultChunkSize = options.chunkSize || 1000; // デフォルトチャンクサイズ
        this.maxMemoryUsage = options.maxMemoryUsage || 50 * 1024 * 1024; // 50MB
        this.progressInterval = options.progressInterval || 100; // プログレス更新間隔
        this.yieldInterval = options.yieldInterval || 10; // イベントループに制御を戻す間隔
        
        // 状態管理
        this.activeProcesses = new Map();
        this.memoryUsage = 0;
        this.processCounter = 0;
        
        // 統計情報
        this.stats = {
            totalProcessed: 0,
            totalChunks: 0,
            averageChunkTime: 0,
            memoryPeakUsage: 0,
            totalProcessingTime: 0
        };
        
        // イベントリスナー
        this.listeners = new Map();
        
        console.log('ChunkProcessor initialized');
    }
    
    /**
     * 配列データをチャンクに分割して処理
     * 
     * @param {Array} data - 処理対象データ
     * @param {Function} processor - 各チャンクを処理する関数
     * @param {Object} options - オプション
     * @returns {Promise<Array>} - 処理結果の配列
     */
    async processArray(data, processor, options = {}) {
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        
        const processId = this.generateProcessId();
        const chunkSize = options.chunkSize || this.defaultChunkSize;
        const startTime = Date.now();
        
        try {
            // プロセス情報を登録
            const processInfo = {
                id: processId,
                totalItems: data.length,
                processedItems: 0,
                totalChunks: Math.ceil(data.length / chunkSize),
                processedChunks: 0,
                startTime,
                results: [],
                options
            };
            
            this.activeProcesses.set(processId, processInfo);
            
            this.emit('processStarted', {
                id: processId,
                totalItems: data.length,
                totalChunks: processInfo.totalChunks
            });
            
            // チャンクに分割して処理
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                const chunkIndex = Math.floor(i / chunkSize);
                
                // メモリ使用量チェック
                await this.checkMemoryUsage();
                
                // チャンク処理
                const chunkStartTime = Date.now();
                const chunkResult = await this.processChunk(
                    chunk, 
                    processor, 
                    chunkIndex, 
                    processInfo,
                    options
                );
                
                const chunkDuration = Date.now() - chunkStartTime;
                this.updateChunkStats(chunkDuration);
                
                // 結果を保存
                if (options.collectResults !== false) {
                    if (Array.isArray(chunkResult)) {
                        processInfo.results.push(...chunkResult);
                    } else {
                        processInfo.results.push(chunkResult);
                    }
                }
                
                // 進捗更新
                processInfo.processedChunks++;
                processInfo.processedItems = Math.min(i + chunkSize, data.length);
                
                this.emit('chunkProcessed', {
                    id: processId,
                    chunkIndex,
                    processedItems: processInfo.processedItems,
                    totalItems: processInfo.totalItems,
                    progress: (processInfo.processedItems / processInfo.totalItems) * 100
                });
                
                // 定期的にイベントループに制御を戻す
                if (chunkIndex % this.yieldInterval === 0) {
                    await this.yieldControl();
                }
            }
            
            const totalDuration = Date.now() - startTime;
            this.updateProcessStats(totalDuration, processInfo.totalChunks);
            
            this.emit('processCompleted', {
                id: processId,
                totalItems: processInfo.totalItems,
                duration: totalDuration,
                results: options.collectResults !== false ? processInfo.results : undefined
            });
            
            const results = options.collectResults !== false ? processInfo.results : [];
            this.activeProcesses.delete(processId);
            
            return results;
            
        } catch (error) {
            this.activeProcesses.delete(processId);
            
            this.emit('processError', {
                id: processId,
                error: error.message,
                processedItems: this.activeProcesses.get(processId)?.processedItems || 0
            });
            
            getErrorHandler().handleError(error, 'CHUNK_PROCESSING_ERROR', {
                processId,
                dataLength: data.length,
                chunkSize,
                options
            });
            
            throw error;
        }
    }
    
    /**
     * オブジェクトデータをチャンクに分割して処理
     * 
     * @param {Object} data - 処理対象オブジェクト
     * @param {Function} processor - 各チャンクを処理する関数
     * @param {Object} options - オプション
     * @returns {Promise<Object>} - 処理結果のオブジェクト
     */
    async processObject(data, processor, options = {}) {
        if (typeof data !== 'object' || data === null) {
            throw new Error('Data must be an object');
        }
        
        const entries = Object.entries(data);
        const processId = this.generateProcessId();
        const chunkSize = options.chunkSize || this.defaultChunkSize;
        
        try {
            const results = await this.processArray(
                entries,
                async (entryChunk) => {
                    const chunkObject = Object.fromEntries(entryChunk);
                    return await processor(chunkObject);
                },
                {
                    ...options,
                    collectResults: true
                }
            );
            
            // 結果をオブジェクトに再構成
            if (options.mergeResults !== false) {
                return this.mergeChunkResults(results, options);
            }
            
            return results;
            
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * ストリーミング処理
     * 
     * @param {Function} dataProvider - データを提供する関数
     * @param {Function} processor - データを処理する関数
     * @param {Object} options - オプション
     * @returns {Promise<Array>} - 処理結果
     */
    async processStream(dataProvider, processor, options = {}) {
        const processId = this.generateProcessId();
        const batchSize = options.batchSize || 100;
        const results = [];
        
        try {
            this.emit('streamStarted', { id: processId });
            
            let batch = [];
            let hasMore = true;
            let processedCount = 0;
            
            while (hasMore) {
                // データを取得
                const item = await dataProvider();
                
                if (item === null || item === undefined) {
                    hasMore = false;
                    // 残りのバッチを処理
                    if (batch.length > 0) {
                        const batchResult = await this.processChunk(
                            batch,
                            processor,
                            Math.floor(processedCount / batchSize),
                            { id: processId },
                            options
                        );
                        results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));
                    }
                    break;
                }
                
                batch.push(item);
                
                // バッチサイズに達したら処理
                if (batch.length >= batchSize) {
                    const batchResult = await this.processChunk(
                        batch,
                        processor,
                        Math.floor(processedCount / batchSize),
                        { id: processId },
                        options
                    );
                    
                    results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));
                    processedCount += batch.length;
                    batch = [];
                    
                    this.emit('streamProgress', {
                        id: processId,
                        processedCount
                    });
                    
                    // メモリチェックと制御移譲
                    await this.checkMemoryUsage();
                    await this.yieldControl();
                }
            }
            
            this.emit('streamCompleted', {
                id: processId,
                totalProcessed: processedCount,
                results: options.collectResults !== false ? results : undefined
            });
            
            return options.collectResults !== false ? results : [];
            
        } catch (error) {
            this.emit('streamError', {
                id: processId,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * 個別チャンクの処理
     */
    async processChunk(chunk, processor, chunkIndex, processInfo, options) {
        try {
            // メモリ使用量の推定更新
            this.updateMemoryUsage(chunk);
            
            // チャンク処理実行
            const result = await processor(chunk, chunkIndex, {
                processId: processInfo.id,
                totalItems: processInfo.totalItems,
                processedItems: processInfo.processedItems
            });
            
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CHUNK_PROCESS_ERROR', {
                chunkIndex,
                chunkSize: chunk.length,
                processId: processInfo.id
            });
            throw error;
        }
    }
    
    /**
     * メモリ使用量チェック
     */
    async checkMemoryUsage() {
        if (this.memoryUsage > this.maxMemoryUsage) {
            // メモリ使用量が上限を超えた場合、ガベージコレクションを実行
            if (global.gc) {
                global.gc();
            }
            
            // 少し待機してメモリを解放
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // メモリ使用量をリセット
            this.memoryUsage = Math.max(0, this.memoryUsage * 0.7);
        }
    }
    
    /**
     * メモリ使用量の更新
     */
    updateMemoryUsage(data) {
        try {
            // データサイズの推定
            const dataSize = JSON.stringify(data).length * 2; // Unicode文字を考慮
            this.memoryUsage += dataSize;
            
            if (this.memoryUsage > this.stats.memoryPeakUsage) {
                this.stats.memoryPeakUsage = this.memoryUsage;
            }
        } catch (error) {
            // JSON.stringifyが失敗した場合は推定値を使用
            this.memoryUsage += Array.isArray(data) ? data.length * 100 : 1000;
        }
    }
    
    /**
     * イベントループに制御を戻す
     */
    async yieldControl() {
        return new Promise(resolve => setImmediate(resolve));
    }
    
    /**
     * チャンク統計の更新
     */
    updateChunkStats(duration) {
        this.stats.totalChunks++;
        const currentAvg = this.stats.averageChunkTime;
        this.stats.averageChunkTime = 
            (currentAvg * (this.stats.totalChunks - 1) + duration) / this.stats.totalChunks;
    }
    
    /**
     * プロセス統計の更新
     */
    updateProcessStats(duration, chunksProcessed) {
        this.stats.totalProcessed++;
        this.stats.totalProcessingTime += duration;
    }
    
    /**
     * チャンク結果のマージ
     */
    mergeChunkResults(results, options) {
        try {
            if (options.mergeStrategy === 'object') {
                return results.reduce((merged, result) => {
                    return { ...merged, ...result };
                }, {});
            } else if (options.mergeStrategy === 'array') {
                return results.flat();
            } else if (typeof options.customMerger === 'function') {
                return options.customMerger(results);
            }
            
            // デフォルト: 配列として返す
            return results;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CHUNK_RESULT_MERGE_ERROR', {
                resultsCount: results.length,
                mergeStrategy: options.mergeStrategy
            });
            return results; // フォールバック
        }
    }
    
    /**
     * プロセスIDの生成
     */
    generateProcessId() {
        return `chunk_${Date.now()}_${++this.processCounter}`;
    }
    
    /**
     * アクティブプロセスの状態を取得
     */
    getActiveProcesses() {
        return Array.from(this.activeProcesses.values()).map(process => ({
            id: process.id,
            totalItems: process.totalItems,
            processedItems: process.processedItems,
            progress: (process.processedItems / process.totalItems) * 100,
            duration: Date.now() - process.startTime
        }));
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            ...this.stats,
            currentMemoryUsage: this.memoryUsage,
            activeProcesses: this.activeProcesses.size
        };
    }
    
    /**
     * プロセスのキャンセル
     */
    cancelProcess(processId) {
        if (this.activeProcesses.has(processId)) {
            this.activeProcesses.delete(processId);
            this.emit('processCancelled', { id: processId });
            return true;
        }
        return false;
    }
    
    /**
     * イベントリスナーの追加
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * イベントの発火
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in chunk processor event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        // アクティブプロセスをクリア
        this.activeProcesses.clear();
        this.listeners.clear();
        this.memoryUsage = 0;
        
        console.log('ChunkProcessor destroyed');
    }
}

// シングルトンインスタンス
let processorInstance = null;

/**
 * ChunkProcessorシングルトンインスタンスの取得
 */
export function getChunkProcessor() {
    if (!processorInstance) {
        processorInstance = new ChunkProcessor();
    }
    return processorInstance;
}