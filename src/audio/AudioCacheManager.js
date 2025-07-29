/**
 * AudioCacheManager - 効率的音響キャッシュシステム
 * 
 * LRU（Least Recently Used）キャッシュの実装、メモリ使用量監視と自動クリーンアップ、
 * 音響データの段階的読み込み機能を提供します。
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * LRUキャッシュノード
 */
class CacheNode {
    constructor(key, value, size) {
        this.key = key;
        this.value = value;
        this.size = size; // バイト単位のサイズ
        this.accessTime = Date.now();
        this.hitCount = 1;
        this.prev = null;
        this.next = null;
    }
}

/**
 * LRUキャッシュ実装
 */
class LRUCache {
    constructor(maxSize = 50 * 1024 * 1024) { // デフォルト50MB
        this.maxSize = maxSize;
        this.currentSize = 0;
        this.cache = new Map();
        
        // ダミーノードで双方向リストを初期化
        this.head = new CacheNode(null, null, 0);
        this.tail = new CacheNode(null, null, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        
        // 統計情報
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccesses: 0
        };
    }
    
    /**
     * キャッシュから値を取得
     * @param {string} key - キー
     * @returns {*} 値またはnull
     */
    get(key) {
        this.stats.totalAccesses++;
        
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            
            // アクセス情報を更新
            node.accessTime = Date.now();
            node.hitCount++;
            
            // ノードを最前面に移動
            this._moveToHead(node);
            
            this.stats.hits++;
            return node.value;
        }
        
        this.stats.misses++;
        return null;
    }
    
    /**
     * キャッシュに値を設定
     * @param {string} key - キー
     * @param {*} value - 値
     * @param {number} size - サイズ（バイト）
     */
    set(key, value, size) {
        if (this.cache.has(key)) {
            // 既存エントリを更新
            const node = this.cache.get(key);
            const oldSize = node.size;
            
            node.value = value;
            node.size = size;
            node.accessTime = Date.now();
            node.hitCount++;
            
            this.currentSize += (size - oldSize);
            this._moveToHead(node);
        } else {
            // 新しいエントリを追加
            const newNode = new CacheNode(key, value, size);
            
            this.cache.set(key, newNode);
            this._addToHead(newNode);
            
            this.currentSize += size;
        }
        
        // サイズ制限をチェックして必要に応じて削除
        while (this.currentSize > this.maxSize) {
            this._evictLRU();
        }
    }
    
    /**
     * キャッシュから削除
     * @param {string} key - キー
     * @returns {boolean} 削除成功
     */
    delete(key) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            this._removeNode(node);
            this.cache.delete(key);
            this.currentSize -= node.size;
            return true;
        }
        return false;
    }
    
    /**
     * キャッシュをクリア
     */
    clear() {
        this.cache.clear();
        this.currentSize = 0;
        this.head.next = this.tail;
        this.tail.prev = this.head;
        
        // 統計をリセット
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccesses: 0
        };
    }
    
    /**
     * ノードを先頭に移動
     * @param {CacheNode} node - ノード
     * @private
     */
    _moveToHead(node) {
        this._removeNode(node);
        this._addToHead(node);
    }
    
    /**
     * ノードを先頭に追加
     * @param {CacheNode} node - ノード
     * @private
     */
    _addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    
    /**
     * ノードを削除
     * @param {CacheNode} node - ノード
     * @private
     */
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    /**
     * LRUエントリを削除
     * @private
     */
    _evictLRU() {
        const lru = this.tail.prev;
        if (lru !== this.head) {
            this._removeNode(lru);
            this.cache.delete(lru.key);
            this.currentSize -= lru.size;
            this.stats.evictions++;
        }
    }
    
    /**
     * キャッシュ統計を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        const hitRate = this.stats.totalAccesses > 0 ? 
            this.stats.hits / this.stats.totalAccesses : 0;
            
        return {
            ...this.stats,
            hitRate: hitRate,
            currentSize: this.currentSize,
            maxSize: this.maxSize,
            entryCount: this.cache.size,
            memoryUsageRatio: this.currentSize / this.maxSize
        };
    }
}

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
        
        // メモリ監視
        this.memoryMonitor = {
            intervalId: null,
            lastCleanup: Date.now(),
            alerts: [],
            systemMemoryInfo: null
        };
        
        // 段階的読み込み管理
        this.lazyLoadManager = {
            activeLoads: new Map(),
            chunkIndex: new Map(),
            preloadQueue: []
        };
        
        // パフォーマンス統計
        this.performanceStats = {
            cacheHits: 0,
            cacheMisses: 0,
            loadTimes: [],
            memoryUsage: [],
            cleanupOperations: 0
        };
        
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
            this._startMemoryMonitoring();
            
            // 自動クリーンアップを設定
            this._setupAutoCleanup();
            
            console.log('AudioCacheManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'initialize',
                component: 'AudioCacheManager'
            });
        }
    }
    
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
     * メモリ監視を開始
     * @private
     */
    _startMemoryMonitoring() {
        try {
            // 既存の監視を停止
            this._stopMemoryMonitoring();
            
            // 定期的なメモリ監視
            this.memoryMonitor.intervalId = setInterval(() => {
                this._checkMemoryUsage();
                this._updateMemoryStats();
            }, this.cacheSettings.cleanupInterval);
            
            console.log('Memory monitoring started');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_startMemoryMonitoring'
            });
        }
    }
    
    /**
     * メモリ監視を停止
     * @private
     */
    _stopMemoryMonitoring() {
        try {
            if (this.memoryMonitor.intervalId) {
                clearInterval(this.memoryMonitor.intervalId);
                this.memoryMonitor.intervalId = null;
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_stopMemoryMonitoring'
            });
        }
    }
    
    /**
     * 自動クリーンアップを設定
     * @private
     */
    _setupAutoCleanup() {
        try {
            // 定期的なクリーンアップタスク
            setInterval(() => {
                this._performAutomaticCleanup();
            }, this.cacheSettings.cleanupInterval);
            
            console.log('Auto cleanup configured');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_setupAutoCleanup'
            });
        }
    }
    
    /**
     * AudioBufferをキャッシュに保存
     * @param {string} key - キー
     * @param {AudioBuffer} buffer - AudioBuffer
     * @param {Object} metadata - メタデータ
     */
    setAudioBuffer(key, buffer, metadata = {}) {
        try {
            const size = this._calculateBufferSize(buffer);
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
                this._shouldOptimizeForCache(size)) {
                // 最適化後にキャッシュ
                this._optimizeAndCache(key, buffer, cacheEntry.metadata);
            } else {
                // そのままキャッシュ
                this.audioBufferCache.set(key, cacheEntry, size);
            }
            
            console.log(`Audio buffer cached: ${key} (${this._formatSize(size)})`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'setAudioBuffer',
                key: key
            });
        }
    }
    
    /**
     * AudioBufferをキャッシュから取得
     * @param {string} key - キー
     * @returns {AudioBuffer|null} AudioBuffer
     */
    getAudioBuffer(key) {
        try {
            const startTime = performance.now();
            const cacheEntry = this.audioBufferCache.get(key);
            
            if (cacheEntry) {
                this.performanceStats.cacheHits++;
                const loadTime = performance.now() - startTime;
                this.performanceStats.loadTimes.push(loadTime);
                
                console.log(`Cache hit: ${key} (${loadTime.toFixed(2)}ms)`);
                return cacheEntry.buffer;
            }
            
            this.performanceStats.cacheMisses++;
            console.log(`Cache miss: ${key}`);
            return null;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'getAudioBuffer',
                key: key
            });
            return null;
        }
    }
    
    /**
     * AudioBufferを段階的に読み込み
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     */
    async getLazyAudioBuffer(key, loadFunction, options = {}) {
        try {
            // キャッシュから確認
            const cachedBuffer = this.getAudioBuffer(key);
            if (cachedBuffer) {
                return cachedBuffer;
            }
            
            // 段階的読み込みが有効な場合
            if (this.cacheSettings.lazyLoading.enabled) {
                return await this._performLazyLoad(key, loadFunction, options);
            }
            
            // 通常の読み込み
            const buffer = await loadFunction();
            if (buffer) {
                this.setAudioBuffer(key, buffer);
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'getLazyAudioBuffer',
                key: key
            });
            return null;
        }
    }
    
    /**
     * 段階的読み込みを実行
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     * @private
     */
    async _performLazyLoad(key, loadFunction, options) {
        try {
            console.log(`Starting lazy load for: ${key}`);
            
            // 既にアクティブな読み込みがあるかチェック
            if (this.lazyLoadManager.activeLoads.has(key)) {
                return await this.lazyLoadManager.activeLoads.get(key);
            }
            
            // 読み込みプロミスを作成
            const loadPromise = this._executeLazyLoad(key, loadFunction, options);
            this.lazyLoadManager.activeLoads.set(key, loadPromise);
            
            try {
                const result = await loadPromise;
                return result;
            } finally {
                this.lazyLoadManager.activeLoads.delete(key);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_performLazyLoad',
                key: key
            });
            return null;
        }
    }
    
    /**
     * 段階的読み込みを実行
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     * @private
     */
    async _executeLazyLoad(key, loadFunction, options) {
        try {
            const chunkSize = options.chunkSize || this.cacheSettings.lazyLoading.chunkSize;
            
            // まずメタデータを読み込み
            const metadata = await this._loadAudioMetadata(loadFunction);
            if (!metadata) {
                throw new Error('Failed to load audio metadata');
            }
            
            // 全体のAudioBufferを作成
            const fullBuffer = this.audioContext.createBuffer(
                metadata.numberOfChannels,
                metadata.length,
                metadata.sampleRate
            );
            
            // チャンクに分割して読み込み
            const totalChunks = Math.ceil(metadata.length / chunkSize);
            const chunks = [];
            
            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const startSample = chunkIndex * chunkSize;
                const endSample = Math.min(startSample + chunkSize, metadata.length);
                
                const chunkKey = `${key}_chunk_${chunkIndex}`;
                
                // チャンクがキャッシュにあるかチェック
                let chunkData = this.chunkCache.get(chunkKey);
                
                if (!chunkData) {
                    // チャンクを読み込み
                    chunkData = await this._loadAudioChunk(
                        loadFunction, 
                        startSample, 
                        endSample - startSample,
                        metadata
                    );
                    
                    if (chunkData) {
                        // チャンクをキャッシュに保存
                        const chunkSize = chunkData.length * metadata.numberOfChannels * 4;
                        this.chunkCache.set(chunkKey, chunkData, chunkSize);
                    }
                }
                
                if (chunkData) {
                    chunks.push({ index: chunkIndex, data: chunkData, start: startSample });
                }
            }
            
            // チャンクを組み合わせて完全なバッファを作成
            this._assembleChunksIntoBuffer(fullBuffer, chunks, metadata);
            
            // 完成したバッファをキャッシュに保存
            this.setAudioBuffer(key, fullBuffer, metadata);
            
            console.log(`Lazy load completed for: ${key} (${chunks.length} chunks)`);
            return fullBuffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_executeLazyLoad',
                key: key
            });
            return null;
        }
    }
    
    /**
     * 音響メタデータを読み込み
     * @param {Function} loadFunction - 読み込み関数
     * @returns {Promise<Object>} メタデータ
     * @private
     */
    async _loadAudioMetadata(loadFunction) {
        try {
            // 実際の実装では、loadFunctionから部分的なデータを読み込んでメタデータを抽出
            // ここでは簡略化して全体を読み込んでメタデータを取得
            const buffer = await loadFunction();
            if (!buffer) {
                return null;
            }
            
            return {
                numberOfChannels: buffer.numberOfChannels,
                length: buffer.length,
                sampleRate: buffer.sampleRate,
                duration: buffer.duration
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_loadAudioMetadata'
            });
            return null;
        }
    }
    
    /**
     * 音響チャンクを読み込み
     * @param {Function} loadFunction - 読み込み関数
     * @param {number} startSample - 開始サンプル
     * @param {number} sampleCount - サンプル数
     * @param {Object} metadata - メタデータ
     * @returns {Promise<Float32Array[]>} チャンクデータ
     * @private
     */
    async _loadAudioChunk(loadFunction, startSample, sampleCount, metadata) {
        try {
            // 実際の実装では、範囲指定でデータを読み込む
            // ここでは全体を読み込んで指定範囲を抽出
            const fullBuffer = await loadFunction();
            if (!fullBuffer) {
                return null;
            }
            
            const channels = [];
            for (let channel = 0; channel < metadata.numberOfChannels; channel++) {
                const fullChannelData = fullBuffer.getChannelData(channel);
                const chunkData = fullChannelData.slice(startSample, startSample + sampleCount);
                channels.push(chunkData);
            }
            
            return channels;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_loadAudioChunk',
                startSample: startSample,
                sampleCount: sampleCount
            });
            return null;
        }
    }
    
    /**
     * チャンクをバッファに組み立て
     * @param {AudioBuffer} buffer - 出力バッファ
     * @param {Array} chunks - チャンク配列
     * @param {Object} metadata - メタデータ
     * @private
     */
    _assembleChunksIntoBuffer(buffer, chunks, metadata) {
        try {
            chunks.forEach(chunk => {
                const { data, start } = chunk;
                
                for (let channel = 0; channel < metadata.numberOfChannels; channel++) {
                    const bufferChannelData = buffer.getChannelData(channel);
                    const chunkChannelData = data[channel];
                    
                    for (let i = 0; i < chunkChannelData.length; i++) {
                        bufferChannelData[start + i] = chunkChannelData[i];
                    }
                }
            });
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_assembleChunksIntoBuffer'
            });
        }
    }
    
    /**
     * キャッシュ最適化が必要かチェック
     * @param {number} size - バッファサイズ
     * @returns {boolean} 最適化が必要か
     * @private
     */
    _shouldOptimizeForCache(size) {
        const currentUsage = this.audioBufferCache.currentSize / this.audioBufferCache.maxSize;
        return currentUsage > this.cacheSettings.autoOptimization.compressionThreshold;
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
            // AudioDataOptimizerが利用可能な場合は使用
            // ここでは簡略化した最適化を実装
            const optimizedBuffer = this._performSimpleOptimization(buffer);
            const optimizedSize = this._calculateBufferSize(optimizedBuffer);
            
            const cacheEntry = {
                buffer: optimizedBuffer,
                metadata: {
                    ...metadata,
                    size: optimizedSize,
                    optimized: true
                }
            };
            
            this.audioBufferCache.set(key, cacheEntry, optimizedSize);
            
            console.log(`Optimized buffer cached: ${key} (${this._formatSize(optimizedSize)})`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_optimizeAndCache',
                key: key
            });
        }
    }
    
    /**
     * 簡単な最適化を実行
     * @param {AudioBuffer} buffer - AudioBuffer
     * @returns {AudioBuffer} 最適化されたAudioBuffer
     * @private
     */
    _performSimpleOptimization(buffer) {
        try {
            // ステレオからモノラルへの変換（簡略化）
            if (buffer.numberOfChannels === 2) {
                const monoBuffer = this.audioContext.createBuffer(
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
                operation: '_performSimpleOptimization'
            });
            return buffer;
        }
    }
    
    /**
     * メモリ使用量をチェック
     * @private
     */
    _checkMemoryUsage() {
        try {
            const memoryUsage = this._getCurrentMemoryUsage();
            const pressureThreshold = this.cacheSettings.memoryPressureThreshold;
            
            if (memoryUsage.ratio > pressureThreshold) {
                console.warn(`Memory pressure detected: ${(memoryUsage.ratio * 100).toFixed(1)}%`);
                
                // 緊急クリーンアップを実行
                this._performEmergencyCleanup();
                
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
                operation: '_checkMemoryUsage'
            });
        }
    }
    
    /**
     * 現在のメモリ使用量を取得
     * @returns {Object} メモリ使用量情報
     * @private
     */
    _getCurrentMemoryUsage() {
        const bufferCacheUsage = this.audioBufferCache.currentSize;
        const metadataCacheUsage = this.metadataCache.currentSize;
        const chunkCacheUsage = this.chunkCache.currentSize;
        
        const totalUsage = bufferCacheUsage + metadataCacheUsage + chunkCacheUsage;
        const maxUsage = this.audioBufferCache.maxSize + this.metadataCache.maxSize + this.chunkCache.maxSize;
        
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
     * @private
     */
    _updateMemoryStats() {
        try {
            const memoryUsage = this._getCurrentMemoryUsage();
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
                operation: '_updateMemoryStats'
            });
        }
    }
    
    /**
     * 自動クリーンアップを実行
     * @private
     */
    _performAutomaticCleanup() {
        try {
            const now = Date.now();
            const maxAge = this.cacheSettings.maxAge;
            
            // 期限切れエントリの削除
            this._removeExpiredEntries(maxAge);
            
            // 統計の更新
            this.performanceStats.cleanupOperations++;
            this.memoryMonitor.lastCleanup = now;
            
            console.log('Automatic cleanup completed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_performAutomaticCleanup'
            });
        }
    }
    
    /**
     * 緊急クリーンアップを実行
     * @private
     */
    _performEmergencyCleanup() {
        try {
            const targetReduction = 0.3; // 30%削減を目標
            
            // 使用頻度の低いエントリから削除
            this._removeByUsageFrequency(targetReduction);
            
            console.log('Emergency cleanup completed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: '_performEmergencyCleanup'
            });
        }
    }
    
    /**
     * 期限切れエントリを削除
     * @param {number} maxAge - 最大保持時間（ミリ秒）
     * @private
     */
    _removeExpiredEntries(maxAge) {
        const now = Date.now();
        const expiredKeys = [];
        
        // AudioBufferキャッシュから期限切れを検索
        for (const [key, node] of this.audioBufferCache.cache) {
            if (now - node.accessTime > maxAge) {
                expiredKeys.push(key);
            }
        }
        
        // 期限切れエントリを削除
        expiredKeys.forEach(key => {
            this.audioBufferCache.delete(key);
            this.metadataCache.delete(key + '_meta');
        });
        
        if (expiredKeys.length > 0) {
            console.log(`Removed ${expiredKeys.length} expired cache entries`);
        }
    }
    
    /**
     * 使用頻度に基づいてエントリを削除
     * @param {number} targetReduction - 目標削減率
     * @private
     */
    _removeByUsageFrequency(targetReduction) {
        const entries = [];
        
        // 全エントリの使用頻度情報を収集
        for (const [key, node] of this.audioBufferCache.cache) {
            entries.push({
                key: key,
                hitCount: node.hitCount,
                accessTime: node.accessTime,
                size: node.size,
                score: this._calculateEvictionScore(node)
            });
        }
        
        // スコアの低い順にソート（削除候補）
        entries.sort((a, b) => a.score - b.score);
        
        // 目標削減量まで削除
        const targetSize = this.audioBufferCache.currentSize * targetReduction;
        let removedSize = 0;
        let removedCount = 0;
        
        for (const entry of entries) {
            if (removedSize >= targetSize) {
                break;
            }
            
            this.audioBufferCache.delete(entry.key);
            this.metadataCache.delete(entry.key + '_meta');
            
            removedSize += entry.size;
            removedCount++;
        }
        
        console.log(`Emergency cleanup: removed ${removedCount} entries (${this._formatSize(removedSize)})`);
    }
    
    /**
     * 削除スコアを計算
     * @param {CacheNode} node - キャッシュノード
     * @returns {number} 削除スコア（低いほど削除候補）
     * @private
     */
    _calculateEvictionScore(node) {
        const now = Date.now();
        const timeSinceAccess = now - node.accessTime;
        const hitCountWeight = node.hitCount;
        const sizeWeight = node.size / (1024 * 1024); // MB単位
        
        // スコア計算（時間経過とサイズは削除候補、ヒット数は保持候補）
        return (timeSinceAccess / 60000) + sizeWeight - (hitCountWeight * 0.1);
    }
    
    /**
     * バッファサイズを計算
     * @param {AudioBuffer} buffer - AudioBuffer
     * @returns {number} サイズ（バイト）
     * @private
     */
    _calculateBufferSize(buffer) {
        return buffer.length * buffer.numberOfChannels * 4; // Float32 = 4 bytes
    }
    
    /**
     * サイズをフォーマット
     * @param {number} bytes - バイト数
     * @returns {string} フォーマット済みサイズ
     * @private
     */
    _formatSize(bytes) {
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
     * キャッシュサイズ制限を設定
     * @param {number} maxSize - 最大サイズ（バイト）
     */
    setMaxCacheSize(maxSize) {
        try {
            this.cacheSettings.maxMemorySize = maxSize;
            this.audioBufferCache.maxSize = maxSize;
            
            // 設定を保存
            this.configManager.set('audio', 'cache.maxMemorySize', maxSize);
            
            console.log(`Cache size limit set to ${this._formatSize(maxSize)}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'setMaxCacheSize',
                maxSize: maxSize
            });
        }
    }
    
    /**
     * キャッシュ統計を取得
     * @returns {Object} 統計情報
     */
    getCacheStats() {
        return {
            audioBuffer: this.audioBufferCache.getStats(),
            metadata: this.metadataCache.getStats(),
            chunk: this.chunkCache.getStats(),
            memory: this._getCurrentMemoryUsage(),
            performance: {
                ...this.performanceStats,
                averageLoadTime: this._calculateAverageLoadTime()
            },
            settings: { ...this.cacheSettings }
        };
    }
    
    /**
     * 平均読み込み時間を計算
     * @returns {number} 平均読み込み時間（ミリ秒）
     * @private
     */
    _calculateAverageLoadTime() {
        const loadTimes = this.performanceStats.loadTimes;
        if (loadTimes.length === 0) {
            return 0;
        }
        
        const sum = loadTimes.reduce((acc, time) => acc + time, 0);
        return sum / loadTimes.length;
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
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            // メモリ監視を停止
            this._stopMemoryMonitoring();
            
            // 全キャッシュをクリア
            this.clearCache();
            
            // アクティブな読み込みをクリア
            this.lazyLoadManager.activeLoads.clear();
            this.lazyLoadManager.chunkIndex.clear();
            
            // 参照をクリア
            this.audioBufferCache = null;
            this.metadataCache = null;
            this.chunkCache = null;
            
            console.log('AudioCacheManager disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'dispose'
            });
        }
    }
}