/**
 * Cache Memory Manager Component
 * 
 * メモリ使用量監視と自動最適化機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler } from '../../utils/ErrorHandler';

/**
 * Memory usage information interface
 */
export interface MemoryUsageInfo {
    bufferCache: number;
    metadataCache: number;
    chunkCache: number;
    total: number;
    max: number;
    ratio: number;
}

/**
 * Memory alert interface
 */
export interface MemoryAlert {
    timestamp: number;
    type: 'memory_pressure' | 'memory_warning' | 'memory_critical';
    usage: MemoryUsageInfo;
    action: string;
}

/**
 * Memory usage statistics point
 */
export interface MemoryUsageStatPoint extends MemoryUsageInfo {
    timestamp: number;
}

/**
 * Removal result interface
 */
export interface RemovalResult {
    removedCount: number;
    removedSize: number;
    removedKeys: string[];
}

/**
 * Memory statistics interface
 */
export interface MemoryStats {
    currentUsage: MemoryUsageInfo;
    alerts: MemoryAlert[];
    lastCleanup: number;
    cleanupOperations: number;
    memoryHistory: MemoryUsageStatPoint[];
}

/**
 * Cache settings interface
 */
interface CacheSettings {
    cleanupInterval: number;
    memoryPressureThreshold: number;
    maxAge: number;
    autoOptimization: {
        compressionThreshold: number;
    };
}

/**
 * Cache interface with memory management methods
 */
interface Cache {
    currentSize: number;
    maxSize: number;
    removeExpiredEntries(maxAge: number): string[];
    removeByUsageFrequency(targetReduction: number): RemovalResult;
    delete(key: string): boolean;
}

/**
 * Main controller interface
 */
interface MainController {
    audioContext: AudioContext;
    cacheSettings: CacheSettings;
    audioBufferCache: Cache;
    metadataCache: Cache;
    chunkCache: Cache;
}

export class CacheMemoryManager {
    private readonly mainController: MainController;
    private readonly cacheSettings: CacheSettings;
    
    // メモリ監視
    private memoryMonitor: {
        intervalId: NodeJS.Timeout | null;
        lastCleanup: number;
        alerts: MemoryAlert[];
        systemMemoryInfo: any;
    };
    
    // パフォーマンス統計
    public performanceStats: {
        cleanupOperations: number;
        memoryUsage: MemoryUsageStatPoint[];
    };

    constructor(mainController: MainController) {
        this.mainController = mainController;
        this.cacheSettings = mainController.cacheSettings;
        
        // メモリ監視
        this.memoryMonitor = {
            intervalId: null,
            lastCleanup: Date.now(),
            alerts: [],
            systemMemoryInfo: null
        };
        
        // パフォーマンス統計
        this.performanceStats = {
            cleanupOperations: 0,
            memoryUsage: []
        };
    }
    
    /**
     * メモリ監視を開始
     */
    startMemoryMonitoring(): void {
        try {
            // 既存の監視を停止
            this.stopMemoryMonitoring();
            
            // 定期的なメモリ監視
            this.memoryMonitor.intervalId = setInterval(() => {
                this.checkMemoryUsage();
                this.updateMemoryStats();
            }, this.cacheSettings.cleanupInterval);
            
            console.log('Memory monitoring started');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'startMemoryMonitoring',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * メモリ監視を停止
     */
    stopMemoryMonitoring(): void {
        try {
            if (this.memoryMonitor.intervalId) {
                clearInterval(this.memoryMonitor.intervalId);
                this.memoryMonitor.intervalId = null;
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'stopMemoryMonitoring',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * 自動クリーンアップを設定
     */
    setupAutoCleanup(): void {
        try {
            // 定期的なクリーンアップタスク
            setInterval(() => {
                this.performAutomaticCleanup();
            }, this.cacheSettings.cleanupInterval);
            
            console.log('Auto cleanup configured');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'setupAutoCleanup',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * メモリ使用量をチェック
     */
    checkMemoryUsage(): void {
        try {
            const memoryUsage = this.getCurrentMemoryUsage();
            const pressureThreshold = this.cacheSettings.memoryPressureThreshold;
            
            if (memoryUsage.ratio > pressureThreshold) {
                console.warn(`Memory pressure detected: ${(memoryUsage.ratio * 100).toFixed(1)}%`);
                
                // 緊急クリーンアップを実行
                this.performEmergencyCleanup();
                
                // アラートを記録
                this.memoryMonitor.alerts.push({
                    timestamp: Date.now(),
                    type: 'memory_pressure',
                    usage: memoryUsage,
                    action: 'emergency_cleanup'
                });
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'checkMemoryUsage',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * 現在のメモリ使用量を取得
     * @returns メモリ使用量情報
     */
    getCurrentMemoryUsage(): MemoryUsageInfo {
        const bufferCacheUsage = this.mainController.audioBufferCache.currentSize;
        const metadataCacheUsage = this.mainController.metadataCache.currentSize;
        const chunkCacheUsage = this.mainController.chunkCache.currentSize;
        
        const totalUsage = bufferCacheUsage + metadataCacheUsage + chunkCacheUsage;
        const maxUsage = this.mainController.audioBufferCache.maxSize + 
                        this.mainController.metadataCache.maxSize + 
                        this.mainController.chunkCache.maxSize;
        
        return {
            bufferCache: bufferCacheUsage,
            metadataCache: metadataCacheUsage,
            chunkCache: chunkCacheUsage,
            total: totalUsage,
            max: maxUsage,
            ratio: totalUsage / maxUsage
        };
    }
    
    /**
     * メモリ統計を更新
     */
    updateMemoryStats(): void {
        try {
            const memoryUsage = this.getCurrentMemoryUsage();
            this.performanceStats.memoryUsage.push({
                timestamp: Date.now(),
                ...memoryUsage
            });
            
            // 統計データを最大100件に制限
            if (this.performanceStats.memoryUsage.length > 100) {
                this.performanceStats.memoryUsage.shift();
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'updateMemoryStats',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * 自動クリーンアップを実行
     */
    performAutomaticCleanup(): void {
        try {
            const now = Date.now();
            const maxAge = this.cacheSettings.maxAge;
            
            // 期限切れエントリの削除
            this.removeExpiredEntries(maxAge);
            
            // 統計の更新
            this.performanceStats.cleanupOperations++;
            this.memoryMonitor.lastCleanup = now;
            
            console.log('Automatic cleanup completed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'performAutomaticCleanup',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * 緊急クリーンアップを実行
     */
    performEmergencyCleanup(): void {
        try {
            const targetReduction = 0.3; // 30%削減を目標
            
            // 使用頻度の低いエントリから削除
            const result = this.removeByUsageFrequency(targetReduction);
            
            console.log(`Emergency cleanup completed: removed ${result.removedCount} entries (${this.formatSize(result.removedSize)})`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'performEmergencyCleanup',
                component: 'CacheMemoryManager'
            });
        }
    }
    
    /**
     * 期限切れエントリを削除
     * @param maxAge - 最大保持時間（ミリ秒）
     */
    removeExpiredEntries(maxAge: number): void {
        // AudioBufferキャッシュから期限切れを削除
        const audioExpiredKeys = this.mainController.audioBufferCache.removeExpiredEntries(maxAge);
        
        // 対応するメタデータも削除
        audioExpiredKeys.forEach(key => {
            this.mainController.metadataCache.delete(key + '_meta');
        });
        
        // チャンクキャッシュからも期限切れを削除
        this.mainController.chunkCache.removeExpiredEntries(maxAge);
        
        if (audioExpiredKeys.length > 0) {
            console.log(`Removed ${audioExpiredKeys.length} expired cache entries`);
        }
    }
    
    /**
     * 使用頻度に基づいてエントリを削除
     * @param targetReduction - 目標削減率
     * @returns 削除結果
     */
    removeByUsageFrequency(targetReduction: number): RemovalResult {
        const result = this.mainController.audioBufferCache.removeByUsageFrequency(targetReduction);
        
        // 対応するメタデータも削除
        result.removedKeys.forEach(key => {
            this.mainController.metadataCache.delete(key + '_meta');
        });
        
        return result;
    }
    
    /**
     * バッファサイズを計算
     * @param buffer - AudioBuffer
     * @returns サイズ（バイト）
     */
    calculateBufferSize(buffer: AudioBuffer): number {
        return buffer.length * buffer.numberOfChannels * 4; // Float32 = 4 bytes
    }
    
    /**
     * サイズをフォーマット
     * @param bytes - バイト数
     * @returns フォーマット済みサイズ
     */
    formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)}${units[unitIndex]}`;
    }
    
    /**
     * キャッシュ最適化が必要かチェック
     * @param size - バッファサイズ
     * @returns 最適化が必要か
     */
    shouldOptimizeForCache(size: number): boolean {
        const currentUsage = this.mainController.audioBufferCache.currentSize / 
                           this.mainController.audioBufferCache.maxSize;
        return currentUsage > this.cacheSettings.autoOptimization.compressionThreshold;
    }
    
    /**
     * 簡単な最適化を実行
     * @param buffer - AudioBuffer
     * @returns 最適化されたAudioBuffer
     */
    performSimpleOptimization(buffer: AudioBuffer): AudioBuffer {
        try {
            // ステレオからモノラルへの変換（簡略化）
            if (buffer.numberOfChannels === 2) {
                const monoBuffer = this.mainController.audioContext.createBuffer(
                    1,
                    buffer.length,
                    buffer.sampleRate
                );
                
                const leftChannel = buffer.getChannelData(0);
                const rightChannel = buffer.getChannelData(1);
                const monoChannel = monoBuffer.getChannelData(0);
                
                for (let i = 0; i < buffer.length; i++) {
                    monoChannel[i] = (leftChannel[i] + rightChannel[i]) / 2;
                }
                
                return monoBuffer;
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'performSimpleOptimization',
                component: 'CacheMemoryManager'
            });
            return buffer;
        }
    }
    
    /**
     * メモリ統計を取得
     * @returns メモリ統計
     */
    getMemoryStats(): MemoryStats {
        return {
            currentUsage: this.getCurrentMemoryUsage(),
            alerts: [...this.memoryMonitor.alerts],
            lastCleanup: this.memoryMonitor.lastCleanup,
            cleanupOperations: this.performanceStats.cleanupOperations,
            memoryHistory: [...this.performanceStats.memoryUsage]
        };
    }
    
    /**
     * リソースの解放
     */
    dispose(): void {
        try {
            this.stopMemoryMonitoring();
            this.memoryMonitor.alerts = [];
            this.performanceStats.memoryUsage = [];
            
            console.log('CacheMemoryManager disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'dispose',
                component: 'CacheMemoryManager'
            });
        }
    }
}