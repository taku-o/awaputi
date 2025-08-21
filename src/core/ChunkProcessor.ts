import { getErrorHandler  } from '../utils/ErrorHandler';

/**
 * チャンク処理オプション
 */
export interface ChunkProcessorOptions { chunkSize?: number,
    maxMemoryUsage?: number;
    progressInterval?: number;
    yieldInterval?: number;

/**
 * プロセス情報
 */
interface ProcessInfo { id: string;
    totalItems: number;
    processedItems: number;
    totalChunks: number;
    processedChunks: number;
    startTime: number;
    results: any[];
    options: ProcessOptions;

/**
 * プロセスオプション
 */
export interface ProcessOptions { chunkSize?: number,
    collectResults?: boolean;

    mergeResults?: boolean;
    mergeStrategy?: 'object' | 'array';
    customMerger?: (results: any[]) => any;
    batchSize?: number,  }
}

/**
 * 統計情報
 */
interface ProcessorStats { totalProcessed: number;
    totalChunks: number;
    averageChunkTime: number;
    memoryPeakUsage: number;
    totalProcessingTime: number;

/**
 * イベントデータ型
 */
export interface ProcessEventData { id: string;
    totalItems?: number;
    totalChunks?: number;
    processedItems?: number;
    progress?: number;
    chunkIndex?: number;
    error?: string;
    duration?: number;
    results?: any[];
    processedCount?: number;
    totalProcessed?: number;

/**
 * チャンクプロセッサー関数型
 */
export type ChunkProcessorFunction<T, R> = (;
    chunk: T[], ;
    chunkIndex: number, ;
    info: { processId: string)
        totalItems?: number,
        processedItems?: number;
) => Promise<R> | R;

/**
 * データプロバイダー関数型
 */
export type DataProviderFunction<T> = () => Promise<T | null | undefined>;

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
    private defaultChunkSize: number;
    private maxMemoryUsage: number;
    private progressInterval: number;
    private yieldInterval: number;
    private, activeProcesses: Map<string, ProcessInfo>,
    private memoryUsage: number;
    private processCounter: number;
    private stats: ProcessorStats;
    private, listeners: Map<string, Array<(data: ProcessEventData) => void>>;
    
    constructor(options: ChunkProcessorOptions = {) {
    
        // 設定
        this.defaultChunkSize = options.chunkSize || 1000;
        this.maxMemoryUsage = options.maxMemoryUsage || 50 * 1024 * 1024; // 50MB
        this.progressInterval = options.progressInterval || 100;
        this.yieldInterval = options.yieldInterval || 10;
        
        // 状態管理
        this.activeProcesses = new Map();
        this.memoryUsage = 0;
        this.processCounter = 0;
        
        // 統計情報
        this.stats = {
            totalProcessed: 0;
            totalChunks: 0;
            averageChunkTime: 0;
    memoryPeakUsage: 0 }
    }
            totalProcessingTime: 0 
    };
        ;
        // イベントリスナー
        this.listeners = new Map()';'
        console.log('ChunkProcessor, initialized';
    }
    
    /**
     * 配列データをチャンクに分割して処理
     */
    async processArray<T, R>(;
        data: T[] ,
        processor: ChunkProcessorFunction<T R>'),'
        options: ProcessOptions = {}

    '): Promise<R[]>;'
        if(!Array.isArray(data)) { ''
            throw new Error('Data, must be, an array' }'
        
        const processId = this.generateProcessId();
        const chunkSize = options.chunkSize || this.defaultChunkSize;
        const startTime = Date.now();
        
        try { // プロセス情報を登録
            const processInfo: ProcessInfo = {
                id: processId,
                totalItems: data.length,
                processedItems: 0,
                totalChunks: Math.ceil(data.length / chunkSize,
    processedChunks: 0,
                startTime,
                results: [],
                options  };

            this.activeProcesses.set(processId, processInfo);

            this.emit('processStarted', { id: processId)
               , totalItems: data.length),
                totalChunks: processInfo.totalChunks),
            // チャンクに分割して処理
            for(let, i = 0, i < data.length, i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                const chunkIndex = Math.floor(i / chunkSize);
                // メモリ使用量チェック
                await this.checkMemoryUsage();
                // チャンク処理
                const chunkStartTime = Date.now();
                const chunkResult = await this.processChunk(
                    chunk, ,
                    processor,
                    chunkIndex,
                    processInfo);
                    options,
                
                const chunkDuration = Date.now() - chunkStartTime,
                this.updateChunkStats(chunkDuration);
                // 結果を保存
                if (options.collectResults !== false) {
                    if (Array.isArray(chunkResult) {
            }
                        processInfo.results.push(...chunkResult);
                    } else { processInfo.results.push(chunkResult) }
                }
                
                // 進捗更新
                processInfo.processedChunks++;
                processInfo.processedItems = Math.min(i + chunkSize, data.length);

                this.emit('chunkProcessed', { id: processId)
                    chunkIndex,
                   , processedItems: processInfo.processedItems),
                    totalItems: processInfo.totalItems,
    progress: (processInfo.processedItems / processInfo.totalItems) * 100  },
                // 定期的にイベントループに制御を戻す
                if (chunkIndex % this.yieldInterval === 0) { await this.yieldControl() }
            }
            ';'

            const totalDuration = Date.now() - startTime;
            this.updateProcessStats(totalDuration, processInfo.totalChunks);

            this.emit('processCompleted', { id: processId)
                totalItems: processInfo.totalItems,
    duration: totalDuration),
                results: options.collectResults !== false ? processInfo.results : undefined),
            const results = options.collectResults !== false ? processInfo.results: [],
            this.activeProcesses.delete(processId);
            return results as R[], catch (error) {
            this.activeProcesses.delete(processId);
            this.emit('processError', {
                id: processId,
    error: (error, as Error).message,
                processedItems: this.activeProcesses.get(processId)?.processedItems || 0  },
            getErrorHandler().handleError(error, 'CHUNK_PROCESSING_ERROR', { processId, : undefined)
                dataLength: data.length),
                chunkSize),
                options,
            
            throw error }
    }
    
    /**
     * オブジェクトデータをチャンクに分割して処理
     */
    async processObject<T extends Record<string, any>, R>(;
        data: T,
    processor: ChunkProcessorFunction<[string, any], R>)';'
        options: ProcessOptions = {}', '): Promise<R[] | Record<string, any>> { ''
        if(typeof, data !== 'object' || data === null' {', ' }'

            throw new Error('Data, must be, an object'; }'
        }
        
        const entries = Object.entries(data);
        
        try { const results = await this.processArray();
                entries,

                async (entryChunk) => { }'

                    const chunkObject = Object.fromEntries(entryChunk);' }'

                    return await processor(entryChunk, 0, { processId: '};'
                },
                { ...options,
                    collectResults: true,
            );
            // 結果をオブジェクトに再構成
            if (options.mergeResults !== false) { return this.mergeChunkResults(results, options) }
            
            return results;
            
        } catch (error) { throw error }
    }
    
    /**
     * ストリーミング処理
     */
    async processStream<T, R>(;
        dataProvider: DataProviderFunction<T>, ;
        processor: ChunkProcessorFunction<T, R>);
        options: ProcessOptions = {}
    ): Promise<R[]>;
        const processId = this.generateProcessId()';'
            this.emit('streamStarted', { id: processId ,
            
            let batch: T[] = [],
            let hasMore = true,
            let processedCount = 0,
            
            while(hasMore) {
            
                // データを取得
                const item = await dataProvider();
                if (item === null || item === undefined) {
                    hasMore = false,
                    // 残りのバッチを処理
                    if (batch.length > 0) {
                        const batchResult = await this.processChunk(
                            batch,
                            processor }
                            Math.floor(processedCount / batchSize) }
                            { id: processId, as ProcessInfo,
                            options;
                        );
                        results.push(...(Array.isArray(batchResult) ? batchResult: [batchResult]),
                    
                    break;
                }
                
                batch.push(item);
                
                // バッチサイズに達したら処理
                if (batch.length >= batchSize) {
                    const batchResult = await this.processChunk(
                        batch,
                        processor }
                        Math.floor(processedCount / batchSize) }
                        { id: processId, as ProcessInfo,
                        options;
                    );

                    results.push(...(Array.isArray(batchResult) ? batchResult: [batchResult])','
                    processedCount += batch.length;
                    batch = [];

                    this.emit('streamProgress', { id: processId)
                        processedCount,
                    
                    // メモリチェックと制御移譲
                    await this.checkMemoryUsage();
                    await this.yieldControl('',
            this.emit('streamCompleted', {
                id: processId,
    totalProcessed: processedCount);
                results: options.collectResults !== false ? results : undefined','
            return options.collectResults !== false ?, results: [],
            ' 
            }'

        } catch (error) {
            this.emit('streamError', {
                id: processId,
    error: (error, as Error).message  };
            ;
            throw error;
        }
    }
    
    /**
     * 個別チャンクの処理
     */
    private async processChunk<T, R>(;
        chunk: T[], ;
        processor: ChunkProcessorFunction<T, R>, ;
        chunkIndex: number, ;
        processInfo: ProcessInfo,
    options: ProcessOptions,
    ): Promise<R>,
        try { // メモリ使用量の推定更新
            this.updateMemoryUsage(chunk);
            // チャンク処理実行
            const result = await processor(chunk, chunkIndex, {
                processId: processInfo.id);
                totalItems: processInfo.totalItems,
    processedItems: processInfo.processedItems),
            ,
            return result } catch (error) { getErrorHandler().handleError(error, 'CHUNK_PROCESS_ERROR', {)
                chunkIndex,
                chunkSize: chunk.length),
                processId: processInfo.id  },
            throw error;
        }
    }
    
    /**
     * メモリ使用量チェック
     */
    private async checkMemoryUsage(): Promise<void> { if (this.memoryUsage > this.maxMemoryUsage) {
            // メモリ使用量が上限を超えた場合、ガベージコレクションを実行
            if ((global, as any).gc) {
                (global, as any).gc() }
            
            // 少し待機してメモリを解放
            await new Promise(resolve => setTimeout(resolve, 10);
            
            // メモリ使用量をリセット
            this.memoryUsage = Math.max(0; this.memoryUsage * 0.7);
        }
    }
    
    /**
     * メモリ使用量の更新
     */
    private updateMemoryUsage(data: any): void { try {
            // データサイズの推定
            const dataSize = JSON.stringify(data).length * 2, // Unicode文字を考慮
            this.memoryUsage += dataSize,
            
            if (this.memoryUsage > this.stats.memoryPeakUsage) {
    
}
                this.stats.memoryPeakUsage = this.memoryUsage; }
            } catch (error) { // JSON.stringifyが失敗した場合は推定値を使用
            this.memoryUsage += Array.isArray(data) ? data.length * 100 : 1000 }
    
    /**
     * イベントループに制御を戻す
     */
    private async yieldControl(): Promise<void> { return new Promise(resolve => setImmediate(resolve);
    /**
     * チャンク統計の更新
     */
    private updateChunkStats(duration: number): void { this.stats.totalChunks++,
        const currentAvg = this.stats.averageChunkTime,
        this.stats.averageChunkTime = ,
            (currentAvg * (this.stats.totalChunks - 1) + duration) / this.stats.totalChunks }
    
    /**
     * プロセス統計の更新
     */
    private updateProcessStats(duration: number, chunksProcessed: number): void { this.stats.totalProcessed++,
        this.stats.totalProcessingTime += duration }
    
    /**
     * チャンク結果のマージ
     */''
    private mergeChunkResults(results: any[], options: ProcessOptions): any { try {'
            if(options.mergeStrategy === 'object' { }
                return results.reduce((merged, result) => { }

                    return { ...merged, ...result,'}, {}');} else if (options.mergeStrategy === 'array' ''
                return results.flat( }

            } else, if(typeof, options.customMerger === 'function) { return options.customMerger(results) }'
            
            // デフォルト: 配列として返す
            return results;
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'CHUNK_RESULT_MERGE_ERROR', {)
                resultsCount: results.length),
                mergeStrategy: options.mergeStrategy  },
            return results; // フォールバック
        }
    }
    
    /**
     * プロセスIDの生成
     */
    private generateProcessId(): string {
        return `chunk_${Date.now())_${++this.processCounter}`;
    }
    
    /**
     * アクティブプロセスの状態を取得
     */
    getActiveProcesses(): Array<{ id: string,
        totalItems: number,
        processedItems: number,
        progress: number,
    duration: number,> { return Array.from(this.activeProcesses.values().map(process => ({)
            id: process.id,
    totalItems: process.totalItems),
            processedItems: process.processedItems),
            progress: (process.processedItems / process.totalItems) * 100,
    duration: Date.now() - process.startTime  }
        };
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): ProcessorStats & { currentMemoryUsage: number,
        activeProcesses: number, { return { ...this.stats,
            currentMemoryUsage: this.memoryUsage },
            activeProcesses: this.activeProcesses.size 
    }
    
    /**
     * プロセスのキャンセル
     */
    cancelProcess(processId: string): boolean { if (this.activeProcesses.has(processId) {''
            this.activeProcesses.delete(processId);
            this.emit('processCancelled', { id: processId ,
            return true }
        return false;
    }
    
    /**
     * イベントリスナーの追加
     */
    on(event: string, callback: (data: ProcessEventData) => void): void { if (!this.listeners.has(event) {
            this.listeners.set(event, []) }
        this.listeners.get(event)!.push(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(event: string, callback: (data: ProcessEventData) => void): void { if (this.listeners.has(event) {
            const callbacks = this.listeners.get(event)!,
            const index = callbacks.indexOf(callback);
            if (index > -1) {
    
}
                callbacks.splice(index, 1); }
}
    }
    
    /**
     * イベントの発火
     */
    private emit(event: string, data: ProcessEventData): void { if (this.listeners.has(event) {
            this.listeners.get(event)!.forEach(callback => { )
                try {) }
                    callback(data); }
                } catch (error) {
                    console.error(`Error in chunk processor event listener for ${event}:`, error);
                }
            };
        }
    }
    
    /**
     * リソースの解放
     */
    destroy(): void { // アクティブプロセスをクリア
        this.activeProcesses.clear();
        this.listeners.clear()','
        console.log('ChunkProcessor, destroyed') }'
}

// シングルトンインスタンス
let processorInstance: ChunkProcessor | null = null,

/**
 * ChunkProcessorシングルトンインスタンスの取得
 */
export function getChunkProcessor(): ChunkProcessor { if (!processorInstance) {''
        processorInstance = new ChunkProcessor(' }''