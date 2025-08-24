import { getErrorHandler } from '../utils/ErrorHandler';

/**
 * チャンク処理オプション
 */
export interface ChunkProcessorOptions {
    chunkSize?: number;
    maxMemoryUsage?: number;
    progressInterval?: number;
    yieldInterval?: number;
}

/**
 * プロセス情報
 */
interface ProcessInfo {
    id: string;
    totalItems: number;
    processedItems: number;
    totalChunks: number;
    processedChunks: number;
    startTime: number;
    results: any[];
    options: ProcessOptions;
}

/**
 * プロセスオプション
 */
export interface ProcessOptions {
    chunkSize?: number;
    collectResults?: boolean;
    mergeResults?: boolean;
    mergeStrategy?: 'object' | 'array';
    customMerger?: (results: any[]) => any;
    batchSize?: number;
}

/**
 * 統計情報
 */
interface ProcessorStats {
    totalProcessed: number;
    totalChunks: number;
    averageChunkTime: number;
    memoryPeakUsage: number;
    totalProcessingTime: number;
}

/**
 * イベントデータ型
 */
export interface ProcessEventData {
    id: string;
    totalItems?: number;
    totalChunks?: number;
    processedItems?: number;
    progress?: number;
    result?: any;
    error?: Error;
    chunkIndex?: number;
    timestamp?: number;
}

/**
 * 処理関数型
 */
export type ProcessFunction<T, R> = (item: T, index: number, chunk: T[]) => R | Promise<R>;

/**
 * チャンク処理関数型
 */
export type ChunkProcessFunction<T, R> = (chunk: T[], chunkIndex: number, totalChunks: number) => R | Promise<R>;

/**
 * イベントリスナー型
 */
export type ProcessEventListener = (data: ProcessEventData) => void;

/**
 * 大量データの効率的なチャンク処理を行うクラス
 * メモリ使用量を制御しながら非同期処理でパフォーマンスを最適化
 */
export class ChunkProcessor {
    private options: Required<ChunkProcessorOptions>;
    private processes: Map<string, ProcessInfo> = new Map();
    private stats: ProcessorStats;
    private eventListeners: Map<string, ProcessEventListener[]> = new Map();
    private memoryMonitor: NodeJS.Timeout | null = null;
    private isProcessing = false;

    constructor(options: ChunkProcessorOptions = {}) {
        this.options = {
            chunkSize: options.chunkSize || 1000,
            maxMemoryUsage: options.maxMemoryUsage || 100 * 1024 * 1024, // 100MB
            progressInterval: options.progressInterval || 1000, // 1秒
            yieldInterval: options.yieldInterval || 10 // 10チャンクごと
        };

        this.stats = {
            totalProcessed: 0,
            totalChunks: 0,
            averageChunkTime: 0,
            memoryPeakUsage: 0,
            totalProcessingTime: 0
        };

        this.startMemoryMonitoring();
        console.log('[ChunkProcessor] 初期化完了');
    }

    /**
     * メモリ監視の開始
     */
    private startMemoryMonitoring(): void {
        this.memoryMonitor = setInterval(() => {
            const memUsage = this.getMemoryUsage();
            if (memUsage > this.stats.memoryPeakUsage) {
                this.stats.memoryPeakUsage = memUsage;
            }

            // メモリ使用量が制限を超えた場合の警告
            if (memUsage > this.options.maxMemoryUsage) {
                console.warn(`[ChunkProcessor] メモリ使用量が制限を超過: ${memUsage}B / ${this.options.maxMemoryUsage}B`);
                this.emit('memoryWarning', {
                    id: 'memory-monitor',
                    error: new Error(`Memory usage exceeded limit: ${memUsage}B`)
                });
            }
        }, 1000);
    }

    /**
     * 配列データをチャンクに分けて処理
     */
    async processArray<T, R>(
        items: T[],
        processFunction: ProcessFunction<T, R>,
        options: ProcessOptions = {}
    ): Promise<R[]> {
        const processId = this.generateProcessId();
        const chunkSize = options.chunkSize || this.options.chunkSize;
        const collectResults = options.collectResults !== false;

        try {
            // プロセス情報を初期化
            const processInfo: ProcessInfo = {
                id: processId,
                totalItems: items.length,
                processedItems: 0,
                totalChunks: Math.ceil(items.length / chunkSize),
                processedChunks: 0,
                startTime: Date.now(),
                results: [],
                options
            };
            
            this.processes.set(processId, processInfo);
            this.isProcessing = true;

            this.emit('processStart', {
                id: processId,
                totalItems: processInfo.totalItems,
                totalChunks: processInfo.totalChunks
            });

            const results: R[] = [];
            
            // チャンクごとの処理
            for (let i = 0; i < items.length; i += chunkSize) {
                const chunk = items.slice(i, i + chunkSize);
                const chunkIndex = Math.floor(i / chunkSize);

                const chunkResults = await this.processChunk(
                    chunk,
                    processFunction,
                    chunkIndex,
                    processInfo
                );

                if (collectResults) {
                    results.push(...chunkResults);
                }

                processInfo.processedChunks++;
                processInfo.processedItems = Math.min(i + chunkSize, items.length);

                // 進捗イベント
                this.emit('progress', {
                    id: processId,
                    processedItems: processInfo.processedItems,
                    progress: processInfo.processedItems / processInfo.totalItems,
                    chunkIndex
                });

                // 定期的にyield（UIブロッキング防止）
                if (chunkIndex % this.options.yieldInterval === 0) {
                    await this.yield();
                }
            }

            // 結果のマージ処理
            let finalResults = results;
            if (options.mergeResults && results.length > 0) {
                finalResults = await this.mergeResults(results, options);
            }

            const processingTime = Date.now() - processInfo.startTime;
            this.updateStats(processInfo, processingTime);

            this.emit('processComplete', {
                id: processId,
                result: finalResults,
                timestamp: Date.now()
            });

            this.processes.delete(processId);
            return finalResults;

        } catch (error) {
            this.emit('processError', {
                id: processId,
                error: error as Error
            });

            getErrorHandler().handleError(error as Error, {
                context: 'ChunkProcessor.processArray',
                processId,
                itemsCount: items.length
            });

            this.processes.delete(processId);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * チャンク単位での処理
     */
    async processChunks<T, R>(
        items: T[],
        chunkProcessor: ChunkProcessFunction<T, R>,
        options: ProcessOptions = {}
    ): Promise<R[]> {
        const processId = this.generateProcessId();
        const chunkSize = options.chunkSize || this.options.chunkSize;

        try {
            const totalChunks = Math.ceil(items.length / chunkSize);
            const results: R[] = [];

            this.emit('processStart', {
                id: processId,
                totalItems: items.length,
                totalChunks
            });

            for (let i = 0; i < items.length; i += chunkSize) {
                const chunk = items.slice(i, i + chunkSize);
                const chunkIndex = Math.floor(i / chunkSize);

                const startTime = performance.now();
                const result = await chunkProcessor(chunk, chunkIndex, totalChunks);
                const endTime = performance.now();

                results.push(result);

                this.emit('chunkComplete', {
                    id: processId,
                    chunkIndex,
                    result,
                    timestamp: Date.now()
                });

                // チャンク処理時間の記録
                const chunkTime = endTime - startTime;
                this.updateChunkStats(chunkTime);

                // 定期的にyield
                if (chunkIndex % this.options.yieldInterval === 0) {
                    await this.yield();
                }
            }

            this.emit('processComplete', {
                id: processId,
                result: results,
                timestamp: Date.now()
            });

            return results;

        } catch (error) {
            this.emit('processError', {
                id: processId,
                error: error as Error
            });

            getErrorHandler().handleError(error as Error, {
                context: 'ChunkProcessor.processChunks',
                processId
            });

            throw error;
        }
    }

    /**
     * 単一チャンクの処理
     */
    private async processChunk<T, R>(
        chunk: T[],
        processFunction: ProcessFunction<T, R>,
        chunkIndex: number,
        processInfo: ProcessInfo
    ): Promise<R[]> {
        const results: R[] = [];
        
        for (let i = 0; i < chunk.length; i++) {
            const item = chunk[i];
            const globalIndex = chunkIndex * this.options.chunkSize + i;
            
            try {
                const result = await processFunction(item, globalIndex, chunk);
                results.push(result);
            } catch (error) {
                this.emit('itemError', {
                    id: processInfo.id,
                    chunkIndex,
                    error: error as Error
                });

                // エラー処理戦略に応じて継続するかどうか決める
                // デフォルトでは継続
                console.warn(`[ChunkProcessor] アイテム処理エラー (chunk: ${chunkIndex}, item: ${i}):`, error);
            }
        }

        return results;
    }

    /**
     * 結果のマージ
     */
    private async mergeResults<R>(results: R[], options: ProcessOptions): Promise<R[]> {
        if (options.customMerger) {
            return options.customMerger(results);
        }

        switch (options.mergeStrategy) {
            case 'object':
                return [Object.assign({}, ...results)] as unknown as R[];
            case 'array':
            default:
                return results.flat() as R[];
        }
    }

    /**
     * 処理の一時停止（UIブロッキング防止）
     */
    private yield(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    /**
     * 統計情報の更新
     */
    private updateStats(processInfo: ProcessInfo, processingTime: number): void {
        this.stats.totalProcessed += processInfo.processedItems;
        this.stats.totalChunks += processInfo.processedChunks;
        this.stats.totalProcessingTime += processingTime;
        
        if (processInfo.processedChunks > 0) {
            this.stats.averageChunkTime = processingTime / processInfo.processedChunks;
        }
    }

    /**
     * チャンク統計の更新
     */
    private updateChunkStats(chunkTime: number): void {
        // 移動平均でチャンク時間を更新
        const alpha = 0.1;
        this.stats.averageChunkTime = this.stats.averageChunkTime * (1 - alpha) + chunkTime * alpha;
    }

    /**
     * プロセスIDの生成
     */
    private generateProcessId(): string {
        return `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * メモリ使用量の取得
     */
    private getMemoryUsage(): number {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            return process.memoryUsage().heapUsed;
        }
        
        // ブラウザ環境では概算値
        if ('performance' in globalThis && (performance as any).memory) {
            return (performance as any).memory.usedJSHeapSize || 0;
        }
        
        return 0;
    }

    /**
     * イベントリスナーの登録
     */
    addEventListener(eventType: string, listener: ProcessEventListener): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(listener);
    }

    /**
     * イベントリスナーの削除
     */
    removeEventListener(eventType: string, listener: ProcessEventListener): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * イベントの発火
     */
    private emit(eventType: string, data: ProcessEventData): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`[ChunkProcessor] Event listener error (${eventType}):`, error);
                }
            });
        }
    }

    /**
     * アクティブなプロセス一覧の取得
     */
    getActiveProcesses(): ProcessInfo[] {
        return Array.from(this.processes.values());
    }

    /**
     * 統計情報の取得
     */
    getStats(): ProcessorStats {
        return { ...this.stats };
    }

    /**
     * 処理状態の確認
     */
    isCurrentlyProcessing(): boolean {
        return this.isProcessing;
    }

    /**
     * 設定の更新
     */
    updateOptions(newOptions: Partial<ChunkProcessorOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * 統計のリセット
     */
    resetStats(): void {
        this.stats = {
            totalProcessed: 0,
            totalChunks: 0,
            averageChunkTime: 0,
            memoryPeakUsage: 0,
            totalProcessingTime: 0
        };
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        // アクティブなプロセスをクリア
        this.processes.clear();

        // メモリ監視の停止
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
            this.memoryMonitor = null;
        }

        // イベントリスナーのクリア
        this.eventListeners.clear();

        console.log('[ChunkProcessor] クリーンアップ完了');
    }
}

// シングルトンインスタンス
let chunkProcessorInstance: ChunkProcessor | null = null;

/**
 * ChunkProcessorのシングルトンインスタンスを取得
 */
export function getChunkProcessor(options?: ChunkProcessorOptions): ChunkProcessor {
    if (!chunkProcessorInstance) {
        chunkProcessorInstance = new ChunkProcessor(options);
    }
    return chunkProcessorInstance;
}