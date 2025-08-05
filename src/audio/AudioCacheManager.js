/**
 * AudioCacheManager - Main Controller
 * 
 * 効率的音響キャッシュシステム - Main Controller Pattern実装
 * LRU（Least Recently Used）キャッシュの実装、メモリ使用量監視と自動クリーンアップ、
 * 音響データの段階的読み込み機能を提供します。
 * 
 * Refactored: Phase F.4 - Main Controller Pattern
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

// Import sub-components
import { LRUCache } from './cache/LRUCacheImplementation.js';
import { CacheMemoryManager } from './cache/CacheMemoryManager.js';
import { CacheDataLoader } from './cache/CacheDataLoader.js';
import { CacheStatistics } from './cache/CacheStatistics.js';

export class AudioCacheManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.configManager = getConfigurationManager();
        
        // キャッシュ設定
        this.cacheSettings = {
            // メモリ制限設定
            maxMemorySize: 100 * 1024 * 1024, // 100MB
            maxEntries: 1000,
            
            // クリーンアップ設定
            cleanupInterval: 30000, // 30秒
            maxAge: 300000, // 5分
            memoryPressureThreshold: 0.8, // 80%
            
            // 段階的読み込み設定
            lazyLoading: {
                enabled: true,
                chunkSize: 4096, // サンプル数
                preloadRadius: 2 // 前後のチャンク数
            },
            
            // 自動最適化設定
            autoOptimization: {
                enabled: true,
                compressionThreshold: 0.7, // 70%以上で圧縮
                qualityAdjustment: true
            }
        };
        
        // キャッシュインスタンス
        this.audioBufferCache = new LRUCache(this.cacheSettings.maxMemorySize);
        this.metadataCache = new LRUCache(1024 * 1024); // 1MB for metadata
        this.chunkCache = new LRUCache(this.cacheSettings.maxMemorySize / 2); // 半分をチャンク用
        
        // Initialize sub-components (dependency injection)
        this.memoryManager = new CacheMemoryManager(this);
        this.dataLoader = new CacheDataLoader(this);
        this.statistics = new CacheStatistics(this);
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // 設定から初期化パラメータを読み込み
            this._loadCacheSettings();
            
            // メモリ監視を開始
            this.memoryManager.startMemoryMonitoring();
            
            // 自動クリーンアップを設定
            this.memoryManager.setupAutoCleanup();
            
            console.log('AudioCacheManager initialized with Main Controller Pattern');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'initialize',
                component: 'AudioCacheManager'
            });
        }
    }
    
    // ========================================
    // Public API Methods (delegation to sub-components)
    // ========================================
    
    /**
     * AudioBufferをキャッシュに保存
     * @param {string} key - キー
     * @param {AudioBuffer} buffer - AudioBuffer
     * @param {Object} metadata - メタデータ
     */
    setAudioBuffer(key, buffer, metadata = {}) {
        try {
            const size = this.memoryManager.calculateBufferSize(buffer);
            const cacheEntry = {
                buffer: buffer,
                metadata: {
                    ...metadata,
                    size: size,
                    sampleRate: buffer.sampleRate,
                    numberOfChannels: buffer.numberOfChannels,
                    length: buffer.length,
                    duration: buffer.duration,
                    cached: Date.now()
                }
            };
            
            // メタデータを別途キャッシュ
            this.metadataCache.set(key + '_meta', cacheEntry.metadata, 
                JSON.stringify(cacheEntry.metadata).length);
            
            // 自動最適化の判定
            if (this.cacheSettings.autoOptimization.enabled && 
                this.memoryManager.shouldOptimizeForCache(size)) {
                // 最適化後にキャッシュ
                this._optimizeAndCache(key, buffer, cacheEntry.metadata);
            } else {
                // そのままキャッシュ
                this.audioBufferCache.set(key, cacheEntry, size);
            }
            
            console.log(`Audio buffer cached: ${key} (${this.memoryManager.formatSize(size)})`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'setAudioBuffer',
                key: key
            });
        }
    }
    
    /**
     * AudioBufferをキャッシュから取得（CacheDataLoaderに委譲）
     * @param {string} key - キー
     * @returns {AudioBuffer|null} AudioBuffer
     */
    getAudioBuffer(key) {
        return this.dataLoader.getAudioBuffer(key);
    }
    
    /**
     * AudioBufferを段階的に読み込み（CacheDataLoaderに委譲）
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     */
    async getLazyAudioBuffer(key, loadFunction, options = {}) {
        return this.dataLoader.getLazyAudioBuffer(key, loadFunction, options);
    }
    
    /**
     * キャッシュサイズ制限を設定
     * @param {number} maxSize - 最大サイズ（バイト）
     */
    setMaxCacheSize(maxSize) {
        try {
            this.cacheSettings.maxMemorySize = maxSize;
            this.audioBufferCache.maxSize = maxSize;
            
            // 設定を保存
            this.configManager.set('audio', 'cache.maxMemorySize', maxSize);
            
            console.log(`Cache size limit set to ${this.memoryManager.formatSize(maxSize)}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'setMaxCacheSize',
                maxSize: maxSize
            });
        }
    }
    
    /**
     * キャッシュ統計を取得（CacheStatisticsに委譲）
     * @returns {Object} 統計情報
     */
    getCacheStats() {
        return {
            audioBuffer: this.audioBufferCache.getStats(),
            metadata: this.metadataCache.getStats(),
            chunk: this.chunkCache.getStats(),
            memory: this.memoryManager.getCurrentMemoryUsage(),
            performance: this.dataLoader.getLoaderStats(),
            detailed: this.statistics.generateSummary(),
            settings: { ...this.cacheSettings }
        };
    }
    
    /**
     * キャッシュをクリア
     * @param {string} type - キャッシュタイプ（省略時は全て）
     */
    clearCache(type = 'all') {
        try {
            switch (type) {
                case 'audio':
                    this.audioBufferCache.clear();
                    break;
                case 'metadata':
                    this.metadataCache.clear();
                    break;
                case 'chunk':
                    this.chunkCache.clear();
                    break;
                case 'all':
                default:
                    this.audioBufferCache.clear();
                    this.metadataCache.clear();
                    this.chunkCache.clear();
                    break;
            }
            
            console.log(`Cache cleared: ${type}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'clearCache',
                type: type
            });
        }
    }
    
    // ========================================
    // Configuration and Status Methods
    // ========================================
    
    /**
     * システム状態の取得
     * @returns {Object}
     */
    getStatus() {
        return {
            initialized: true,
            components: {
                memoryManager: this.memoryManager ? 'active' : 'inactive',
                dataLoader: this.dataLoader ? 'active' : 'inactive',
                statistics: this.statistics ? 'active' : 'inactive'
            },
            cacheInstances: {
                audioBuffer: this.audioBufferCache ? 'active' : 'inactive',
                metadata: this.metadataCache ? 'active' : 'inactive',
                chunk: this.chunkCache ? 'active' : 'inactive'
            },
            settings: { ...this.cacheSettings }
        };
    }
    
    /**
     * パフォーマンス分析を実行（CacheStatisticsに委譲）
     * @param {number} timeRangeMs - 分析期間
     * @returns {Object} 分析結果
     */
    analyzePerformance(timeRangeMs) {
        return this.statistics.analyzeTrends(timeRangeMs);
    }
    
    /**
     * 統計データのエクスポート（CacheStatisticsに委譲）
     * @param {string} format - エクスポート形式
     * @returns {string} エクスポートデータ
     */
    exportStatistics(format = 'json') {
        return this.statistics.exportStatistics(format);
    }
    
    // ========================================
    // Private Helper Methods
    // ========================================
    
    /**
     * キャッシュ設定を読み込み
     * @private
     */
    _loadCacheSettings() {
        try {
            const cacheConfig = this.configManager.get('audio', 'cache') || {};
            
            // メモリ設定の更新
            if (cacheConfig.maxMemorySize) {
                this.cacheSettings.maxMemorySize = cacheConfig.maxMemorySize;
                this.audioBufferCache.maxSize = cacheConfig.maxMemorySize;
            }
            
            if (cacheConfig.maxEntries) {
                this.cacheSettings.maxEntries = cacheConfig.maxEntries;
            }
            
            // クリーンアップ設定の更新
            if (cacheConfig.cleanupInterval) {
                this.cacheSettings.cleanupInterval = cacheConfig.cleanupInterval;
            }
            
            if (cacheConfig.maxAge) {
                this.cacheSettings.maxAge = cacheConfig.maxAge;
            }
            
            // 段階的読み込み設定の更新
            if (cacheConfig.lazyLoading) {
                Object.assign(this.cacheSettings.lazyLoading, cacheConfig.lazyLoading);
            }
            
            // 自動最適化設定の更新
            if (cacheConfig.autoOptimization) {
                Object.assign(this.cacheSettings.autoOptimization, cacheConfig.autoOptimization);
            }
            
            console.log('Cache settings loaded from configuration');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_loadCacheSettings'
            });
        }
    }
    
    /**
     * 最適化してキャッシュに保存
     * @param {string} key - キー
     * @param {AudioBuffer} buffer - AudioBuffer
     * @param {Object} metadata - メタデータ
     * @private
     */
    async _optimizeAndCache(key, buffer, metadata) {
        try {
            // 最適化を実行
            const optimizedBuffer = this.memoryManager.performSimpleOptimization(buffer);
            const optimizedSize = this.memoryManager.calculateBufferSize(optimizedBuffer);
            
            const cacheEntry = {
                buffer: optimizedBuffer,
                metadata: {
                    ...metadata,
                    size: optimizedSize,
                    optimized: true
                }
            };
            
            this.audioBufferCache.set(key, cacheEntry, optimizedSize);
            
            console.log(`Optimized buffer cached: ${key} (${this.memoryManager.formatSize(optimizedSize)})`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_optimizeAndCache',
                key: key
            });
        }
    }
    
    // ========================================
    // Lifecycle Management
    // ========================================
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            // サブコンポーネントの解放
            if (this.memoryManager) {
                this.memoryManager.dispose();
            }
            
            if (this.dataLoader) {
                this.dataLoader.dispose();
            }
            
            if (this.statistics) {
                this.statistics.dispose();
            }
            
            // 全キャッシュをクリア
            this.clearCache();
            
            // 参照をクリア
            this.audioBufferCache = null;
            this.metadataCache = null;
            this.chunkCache = null;
            this.memoryManager = null;
            this.dataLoader = null;
            this.statistics = null;
            
            console.log('AudioCacheManager disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'dispose'
            });
        }
    }
}