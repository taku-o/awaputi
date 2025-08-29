/**
 * Cache Memory Manager Component
 * 
 * メモリ使用量監視と自動最適化機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class CacheMemoryManager {
    constructor(mainController) {
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
    startMemoryMonitoring() {
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
    stopMemoryMonitoring() {
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
    setupAutoCleanup() {
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
    checkMemoryUsage() {
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
     * @returns {Object} メモリ使用量情報
     */
    getCurrentMemoryUsage() {
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
    updateMemoryStats() {
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
    performAutomaticCleanup() {
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
    performEmergencyCleanup() {
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
     * @param {number} maxAge - 最大保持時間（ミリ秒）
     */
    removeExpiredEntries(maxAge) {
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
     * @param {number} targetReduction - 目標削減率
     * @returns {Object} 削除結果
     */
    removeByUsageFrequency(targetReduction) {
        const result = this.mainController.audioBufferCache.removeByUsageFrequency(targetReduction);
        
        // 対応するメタデータも削除
        result.removedKeys.forEach(key => {
            this.mainController.metadataCache.delete(key + '_meta');
        });
        
        return result;
    }
    
    /**
     * バッファサイズを計算
     * @param {AudioBuffer} buffer - AudioBuffer
     * @returns {number} サイズ（バイト）
     */
    calculateBufferSize(buffer) {
        return buffer.length * buffer.numberOfChannels * 4; // Float32 = 4 bytes
    }
    
    /**
     * サイズをフォーマット
     * @param {number} bytes - バイト数
     * @returns {string} フォーマット済みサイズ
     */
    formatSize(bytes) {
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
     * @param {number} size - バッファサイズ
     * @returns {boolean} 最適化が必要か
     */
    shouldOptimizeForCache(size) {
        const currentUsage = this.mainController.audioBufferCache.currentSize / 
                           this.mainController.audioBufferCache.maxSize;
        return currentUsage > this.cacheSettings.autoOptimization.compressionThreshold;
    }
    
    /**
     * 簡単な最適化を実行
     * @param {AudioBuffer} buffer - AudioBuffer
     * @returns {AudioBuffer} 最適化されたAudioBuffer
     */
    performSimpleOptimization(buffer) {
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
     * @returns {Object} メモリ統計
     */
    getMemoryStats() {
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
    dispose() {
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