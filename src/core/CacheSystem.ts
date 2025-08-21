/**
 * キャッシュシステム
 * 
 * 設定値と計算結果のキャッシュ機能を提供し、
 * メモリ効率的なキャッシュ管理を実装します。
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

// 型定義
interface CacheOptions { maxSize?: number;
    ttl?: number;
    cleanupInterval?: number;
    priorityFunction?: (entry: CacheEntry) => number ,}
}

interface CacheEntry { value: any;
    expiresAt: number;
    priority: number;
    createdAt: number,
    accessCount: number }

interface CacheStats { hits: number;
    misses: number;
    evictions: number;
    expirations: number;
    size: number,
    totalRequests: number;
    hitRate?: string;
    memoryUsage?: string; }

interface CacheConfig { maxSize: number,
    ttl: number;
    cleanupInterval: number,
    priorityFunction: (entry: CacheEntry) => number ,}
}

interface SetOptions { ttl?: number;
    priority?: number; }

interface MemoryLeak { type: string,
    count?: number;
    usage?: string;
    currentSize?: number;
    maxSize?: number;
    description: string ,}

interface LeakDetectionResult { potentialLeaks: MemoryLeak[];
    recommendations: string[];
    memoryUsage: string;
    cacheSize: number,
    accessHistorySize: number }

interface MemoryStats { cacheSize: number;
    memoryUsage: string,
    accessHistorySize: number }

interface MemoryFixResult { before: MemoryStats;
    after: MemoryStats;
    expiredEntriesRemoved: number;
    memoryFreed: string,
    success: boolean }

interface EntryWithSize { key: string,
    size: number }

interface EntryWithPriority { key: string,
    priority: number }

interface MemoryOverview { totalMemoryUsage: string;
    cacheSize: number;
    accessHistorySize: number,
    averageEntrySize: string }

interface MemoryBreakdown { cacheEntries: string;
    accessHistory: string,
    metadata: string }

interface LargestEntry { key: string,
    size: string }

interface MemoryReport { overview: MemoryOverview;
    breakdown: MemoryBreakdown;
    topLargestEntries: LargestEntry[],
    recommendations: string[] }

class CacheSystem { private cache: Map<string, CacheEntry>;
    private config: CacheConfig;
    private stats: CacheStats;
    private, accessHistory: Map<string, number>;
    private lastCleanup: number;
    private cleanupTimer: NodeJS.Timeout | null = null;
    private, memoryMonitorTimer: NodeJS.Timeout | null = null;
    constructor(options: CacheOptions = {) {
    
        // キャッシュストレージ
        this.cache = new Map();
        
        // キャッシュ設定
        this.config = {
            maxSize: options.maxSize || 1000,
    ttl: options.ttl || 60000, // デフォルト有効期限: 60秒;
            cleanupInterval: options.cleanupInterval || 300000, // デフォルトクリーンアップ間隔: 5分
    }
            priorityFunction: options.priorityFunction || this._defaultPriorityFunction 
    };
        // キャッシュ統計
        this.stats = { hits: 0,
            misses: 0;
            evictions: 0;
            expirations: 0;
            size: 0,
    totalRequests: 0 ,};
        // アクセス履歴（LRU用）
        this.accessHistory = new Map();
        
        // 最終クリーンアップ時刻
        this.lastCleanup = Date.now();
        
        // 自動クリーンアップタイマー
        this._startCleanupTimer();
        
        // メモリ監視タイマー
        this._startMemoryMonitoring();
    }
    
    /**
     * キャッシュに値を設定
     */
    set(key: string, value: any, options: SetOptions = { ): boolean {
        try {
            // キャッシュサイズ制限チェック
            if(this.cache.size >= this.config.maxSize && !this.cache.has(key) {
                
            }
                this._evictItems(1); }
            }
            
            const ttl = options.ttl || this.config.ttl;
            const expiresAt = Date.now() + ttl;
            const priority = options.priority || 0;
            
            // キャッシュエントリを作成
            const entry: CacheEntry = { value,
                expiresAt,
                priority,
                createdAt: Date.now(,
    accessCount: 0 ,}))
            // キャッシュに保存)
            this.cache.set(key, entry);
            
            // 統計更新
            if(!this.accessHistory.has(key) { this.stats.size++; }
            
            // アクセス履歴を更新
            this._updateAccessHistory(key);
            ';

            return true;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.set);
                key,);
                value); });
            return false;
    
    /**
     * キャッシュから値を取得
     */
    get(key: string): any { try {
            this.stats.totalRequests++;
            
            // キャッシュの存在確認
            if(!this.cache.has(key) {
                this.stats.misses++;
            }
                return null;
            
            const entry = this.cache.get(key)!;
            
            // 有効期限チェック
            if(entry.expiresAt < Date.now() {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.expirations++;
                this.stats.misses++;
                this.stats.size--;
            }
                return null;
            
            // アクセス統計を更新
            entry.accessCount++;
            this._updateAccessHistory(key);
            this.stats.hits++;
            ';

            return entry.value;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.get',);
                key); });
            return null;
    
    /**
     * キャッシュから値を削除
     */
    delete(key: string): boolean { try {
            if(this.cache.has(key) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.size--;
            }
                return true;

            return false;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.delete',);
                key); });
            return false;
    
    /**
     * キャッシュをクリア
     */
    clear(prefix: string | null = null): number { try {
            let count = 0;
            
            if(prefix) {
            
                // プレフィックスに一致するキーのみ削除
                for(const, key of, this.cache.keys() {
                    if(key.startsWith(prefix) {
                        this.cache.delete(key);
                        this.accessHistory.delete(key);
            
            }
                        count++; }
}
            } else {  // 全キャッシュをクリア
                count = this.cache.size;
                this.cache.clear(); }
                this.accessHistory.clear(); }
            }
            
            // 統計更新
            this.stats.size -= count;
            if (this.stats.size < 0) this.stats.size = 0;
            ';

            return count;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.clear',);
                prefix); });
            return 0;
    
    /**
     * キャッシュの有効期限を更新
     */
    updateExpiry(key: string, ttl: number | null = null): boolean { try {
            if(!this.cache.has(key) {
                
            }
                return false;
            
            const entry = this.cache.get(key)!;
            const newTtl = ttl || this.config.ttl;
            
            entry.expiresAt = Date.now() + newTtl;

            return true;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.updateExpiry);
                key,);
                ttl); });
            return false;
    
    /**
     * キャッシュの存在確認
     */
    has(key: string): boolean { try {
            if(!this.cache.has(key) {
                
            }
                return false;
            
            const entry = this.cache.get(key)!;
            
            // 有効期限チェック
            if(entry.expiresAt < Date.now() {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.expirations++;
                this.stats.size--;
            }
                return false;
            ';

            return true;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.has',);
                key); });
            return false;
    
    /**
     * キャッシュ統計を取得
     */
    getStats(): CacheStats { const hitRate = this.stats.totalRequests > 0 
            ? (this.stats.hits / this.stats.totalRequests) * 100 ;
            : 0;
        
        return {  };
            ...this.stats, }
            hitRate: `${hitRate.toFixed(2})%`;
            memoryUsage: this._estimateMemoryUsage();
        }
    
    /**
     * キャッシュ設定を更新
     */
    updateConfig(newConfig: Partial<CacheConfig>): void { Object.assign(this.config, newConfig);
        
        // クリーンアップタイマーを再設定
        if(newConfig.cleanupInterval) {
            this._stopCleanupTimer();
        }
            this._startCleanupTimer(); }
}
    
    /**
     * キャッシュのクリーンアップを実行
     */
    cleanup(): number { try {
            let count = 0;
            const now = Date.now();
            
            // 期限切れエントリを削除
            for(const [key, entry] of this.cache.entries() {
                if (entry.expiresAt < now) {
                    this.cache.delete(key);
                    this.accessHistory.delete(key);
                    count++;
            }
                    this.stats.expirations++; }
}
            
            this.lastCleanup = now;
            this.stats.size -= count;
            if (this.stats.size < 0) this.stats.size = 0;
            ';

            return count;''
        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem.cleanup' ,});
            return 0;
    
    /**
     * アイテムを追い出す（キャッシュサイズ制限時）
     */
    private _evictItems(count: number): void { try {
            if (this.cache.size === 0) return;
            
            // 優先度に基づいて追い出し候補を選定
            const candidates: EntryWithPriority[] = Array.from(this.cache.entries().map(([key, entry]) => {  }
                const priority = this.config.priorityFunction(entry); }
                return { key, priority });
            
            // 優先度の低い順にソート
            candidates.sort((a, b) => a.priority - b.priority);
            
            // 指定数のアイテムを追い出し
            const toEvict = candidates.slice(0, count);
            
            for (const { key ) of toEvict) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.evictions++; }
            
            this.stats.size -= toEvict.length;
            if (this.stats.size < 0) this.stats.size = 0;

        } catch (error) { ErrorHandler.handleError(error, {)'
                context: 'CacheSystem._evictItems',);
                count); });
        }
    }
    
    /**
     * アクセス履歴を更新
     */
    private _updateAccessHistory(key: string): void { this.accessHistory.set(key, Date.now(); }
    
    /**
     * デフォルトの優先度計算関数（LRU + 優先度）
     */
    private _defaultPriorityFunction(entry: CacheEntry): number { // 基本優先度（ユーザー指定）
        const basePriority = entry.priority * 1000;
        
        // アクセス頻度ボーナス
        const accessBonus = Math.min(entry.accessCount, 100) * 10;
        
        // 作成時刻ペナルティ（古いほど優先度低）
        const ageMs = Date.now() - entry.createdAt;
        const agePenalty = Math.min(ageMs / 60000, 100) * -5; // 1分あたり5ポイント減
        
        return basePriority + accessBonus + agePenalty; }
    
    /**
     * メモリ使用量を推定
     */
    private _estimateMemoryUsage(): string { try {
            let totalSize = 0;
            
            // キャッシュエントリのサイズを推定
            for(const [key, entry] of this.cache.entries() {
                // キーのサイズ
                totalSize += key.length * 2; // 文字列は約2バイト/文字
                
                // エントリのサイズ
                totalSize += this._estimateObjectSize(entry.value);
                
                // メタデータのサイズ（固定値として推定）
            }
                totalSize += 40; // 数値4つ + オブジェクトオーバーヘッド }
            }
            
            // アクセス履歴のサイズ
            totalSize += this.accessHistory.size * 16; // キー参照 + タイムスタンプ
            
            // 統計情報のサイズ
            totalSize += 48; // 数値6つ + オブジェクトオーバーヘッド
            ';

            return `${Math.round(totalSize / 1024}) KB`;''
        } catch (error) {
            return 'unknown';
    
    /**
     * オブジェクトのサイズを推定
     */
    private _estimateObjectSize(obj: any): number { try {
            const type = typeof obj;

            if(obj === null || obj === undefined) {
                
            }
                return 4;

            if (type === 'boolean'') { return 4; }

            if (type === 'number'') { return 8; }

            if(type === 'string' { return obj.length * 2 + 4; // 文字列は約2バイト/文字 + 長さ }'
            
            if(Array.isArray(obj) {
            
                let size = 16; // 配列オーバーヘッド
                
                // 最初の10要素のみ計算（パフォーマンス対策）
                const sampleSize = Math.min(obj.length, 10);
                if (sampleSize > 0) {
                    let totalSampleSize = 0;
                    for (let, i = 0; i < sampleSize; i++) {
            
            }
                        totalSampleSize += this._estimateObjectSize(obj[i]); }
                    }
                    // 平均サイズ × 全要素数
                    size += (totalSampleSize / sampleSize') * obj.length;
                }
                
                return size;
            }

            if(type === 'object' {'
                let size = 32; // オブジェクトオーバーヘッド
                
                // 最初の10プロパティのみ計算（パフォーマンス対策）
                const keys = Object.keys(obj);
                const sampleSize = Math.min(keys.length, 10);
                
                if (sampleSize > 0) {
                    let totalSampleSize = 0;
                    for (let, i = 0; i < sampleSize; i++) {
                        const key = keys[i];
                        totalSampleSize += key.length * 2; // キー名
            }
                        totalSampleSize += this._estimateObjectSize(obj[key]); // 値 }
                    }
                    // 平均サイズ × 全プロパティ数
                    size += (totalSampleSize / sampleSize) * keys.length;
                }
                
                return size;
            }
            
            return 8; // その他の型
        } catch (error) { return 16; // エラー時のデフォルト値 }
    }
    
    /**
     * クリーンアップタイマーを開始
     */
    private _startCleanupTimer(): void { this.cleanupTimer = setInterval(() => {  }
            this.cleanup(); }
        }, this.config.cleanupInterval);
        
        // ノードプロセスが終了しないようにする
        if (this.cleanupTimer && this.cleanupTimer.unref) { this.cleanupTimer.unref(); }
    }
    
    /**
     * クリーンアップタイマーを停止
     */
    private _stopCleanupTimer(): void { if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null; }
    }
    
    /**
     * メモリ監視を開始
     */
    private _startMemoryMonitoring(): void { this.memoryMonitorTimer = setInterval(() => {  }
            this._performMemoryOptimization(); }
        }, 120000); // 2分間隔でメモリ最適化
        
        // ノードプロセスが終了しないようにする
        if (this.memoryMonitorTimer && this.memoryMonitorTimer.unref) { this.memoryMonitorTimer.unref(); }
    }
    
    /**
     * メモリ監視タイマーを停止
     */
    private _stopMemoryMonitoring(): void { if (this.memoryMonitorTimer) {
            clearInterval(this.memoryMonitorTimer);
            this.memoryMonitorTimer = null; }
    }
    
    /**
     * メモリ最適化を実行
     */
    private _performMemoryOptimization(): void { try {
            const beforeSize = this.cache.size;
            const beforeMemory = this._estimateMemoryUsage();
            
            // 1. 期限切れエントリの削除
            const expiredCount = this._cleanupExpiredEntries();
            
            // 2. 低優先度エントリの削除（メモリ使用量が高い場合）
            const memoryKB = parseInt(beforeMemory);
            if(memoryKB > 5000) {
                // 5MB以上の場合
            }
                this._cleanupLowPriorityEntries(Math.floor(this.cache.size * 0.2); // 20%削除 }
            }
            
            // 3. 古いアクセス履歴のクリーンアップ
            this._cleanupOldAccessHistory();
            
            // 4. 重複データの最適化
            this._optimizeDuplicateData();
            
            const afterSize = this.cache.size;
            const afterMemory = this._estimateMemoryUsage();
            
            if(beforeSize !== afterSize) {
            
                
            
            }
                console.log(`[CacheSystem] Memory optimization: ${beforeSize} -> ${afterSize} entries, ${beforeMemory} -> ${afterMemory}`});''
            } catch (error) { console.error('[CacheSystem] Memory optimization error:', error }
    }
    
    /**
     * 期限切れエントリをクリーンアップ
     */
    private _cleanupExpiredEntries(): number { const now = Date.now();
        let count = 0;
        
        for(const [key, entry] of this.cache.entries() {
        
            if (entry.expiresAt < now) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                count++;
        
        }
                this.stats.expirations++; }
}
        
        this.stats.size -= count;
        if (this.stats.size < 0) this.stats.size = 0;
        
        return count;
    }
    
    /**
     * 低優先度エントリをクリーンアップ
     */
    private _cleanupLowPriorityEntries(targetCount: number): number { if (targetCount <= 0 || this.cache.size === 0) return 0;
        
        // 優先度スコアを計算してソート
        const entries: EntryWithPriority[] = Array.from(this.cache.entries().map(([key, entry]) => {  }
            const priority = this.config.priorityFunction(entry); }
            return { key, priority });
        
        // 優先度の低い順にソート
        entries.sort((a, b) => a.priority - b.priority);
        
        // 指定数のエントリを削除
        const toDelete = entries.slice(0, Math.min(targetCount, entries.length);
        let deletedCount = 0;
        
        for (const { key ) of toDelete) {
            if(this.cache.has(key) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                deletedCount++;
            }
                this.stats.evictions++; }
}
        
        this.stats.size -= deletedCount;
        if (this.stats.size < 0) this.stats.size = 0;
        
        return deletedCount;
    }
    
    /**
     * 古いアクセス履歴をクリーンアップ
     */
    private _cleanupOldAccessHistory(): void { const now = Date.now();
        const maxAge = 3600000; // 1時間
        const keysToDelete: string[] = [],
        
        for(const [key, timestamp] of this.accessHistory.entries() {
        
            if (now - timestamp > maxAge) {
        
        }
                keysToDelete.push(key); }
}
        
        keysToDelete.forEach(key => this.accessHistory.delete(key);
    }
    
    /**
     * 重複データを最適化
     */
    private _optimizeDuplicateData(): void { // 同じ値を持つエントリを特定 }
        const valueMap = new Map<string, Array<{ key: string;, entry: CacheEntry }>>();
        
        for(const [key, entry] of this.cache.entries() {
        
            const valueStr = JSON.stringify(entry.value);
            
            if(!valueMap.has(valueStr) {
        
        }
                valueMap.set(valueStr, []); }
            }
            
            valueMap.get(valueStr)!.push({ key, entry ); }
        
        // 重複する値がある場合、最も新しいもの以外を削除
        for(const, entries of, valueMap.values() {
            if (entries.length > 1) {
                // タイムスタンプでソート（新しい順）
                entries.sort((a, b) => b.entry.createdAt - a.entry.createdAt);
                
                // 最新以外を削除
        }
                for (let, i = 1; i < entries.length; i++) { }
                    const { key } = entries[i];
                    this.cache.delete(key);
                    this.accessHistory.delete(key);
                    this.stats.size--;
                    this.stats.evictions++;
                }
}
    }
    
    /**
     * メモリリークを検出・防止
     */
    detectMemoryLeaks(): LeakDetectionResult { const results: LeakDetectionResult = {
            potentialLeaks: [];
            recommendations: [];
            memoryUsage: this._estimateMemoryUsage(;
            cacheSize: this.cache.size,
    accessHistorySize: this.accessHistory.size }))
        );
        const now = Date.now();
        
        // 1. 長期間アクセスされていないエントリを検出
        const staleThreshold = 1800000; // 30分
        let staleCount = 0;
        
        for(const [key, entry] of this.cache.entries() {
        
            const lastAccess = this.accessHistory.get(key) || entry.createdAt;
            if (now - lastAccess > staleThreshold) {
        
        }
                staleCount++; }
}

        if(staleCount > this.cache.size * 0.3) {
            // 30%以上が古い場合
            results.potentialLeaks.push({)'
                type: 'stale_entries')',
    count: staleCount,')';
                description: '長期間アクセスされていないエントリが多数存在')');

        ,}

            results.recommendations.push('古いエントリのクリーンアップを実行してください'; }'
        }
        
        // 2. アクセス履歴とキャッシュの不整合を検出
        const orphanedHistory: string[] = [],
        for(const, key of, this.accessHistory.keys() {
            if(!this.cache.has(key) {
        }
                orphanedHistory.push(key); }
}

        if(orphanedHistory.length > 0) {'
            results.potentialLeaks.push({)'
                type: 'orphaned_history')',
    count: orphanedHistory.length,')';
                description: 'キャッシュに存在しないアクセス履歴')');''
            results.recommendations.push('アクセス履歴の整合性チェックを実行してください);
            
            // 自動修復
        ,}
            orphanedHistory.forEach(key => this.accessHistory.delete(key); }
        }
        
        // 3. メモリ使用量の異常を検出
        const memoryKB = parseInt(results.memoryUsage);''
        if(memoryKB > 10000) {
            // 10MB以上
            results.potentialLeaks.push({)'
                type: 'high_memory_usage')',
    usage: results.memoryUsage,')';
                description: 'メモリ使用量が異常に高い')');

        ,}

            results.recommendations.push('キャッシュサイズの制限を見直してください'; }'
        }
        ';
        // 4. キャッシュサイズの異常を検出
        if(this.cache.size > this.config.maxSize * 1.1) {
            // 制限の110%以上
            results.potentialLeaks.push({''
                type: 'cache_size_overflow);
                currentSize: this.cache.size'',
    maxSize: this.config.maxSize,')';
                description: 'キャッシュサイズが制限を超過')');

        ,}

            results.recommendations.push('キャッシュの強制クリーンアップを実行してください'; }'
        }
        
        return results;
    }
    
    /**
     * メモリリークを修復
     */
    fixMemoryLeaks(): MemoryFixResult { const beforeStats: MemoryStats = {
            cacheSize: this.cache.size;
            memoryUsage: this._estimateMemoryUsage(,
    accessHistorySize: this.accessHistory.size }))
        // 1. 期限切れエントリの削除)
        const expiredCount = this._cleanupExpiredEntries();
        
        // 2. 古いアクセス履歴の削除
        this._cleanupOldAccessHistory();
        
        // 3. 重複データの最適化
        this._optimizeDuplicateData();
        
        // 4. キャッシュサイズが制限を超えている場合の強制削除
        if(this.cache.size > this.config.maxSize) {
            const excessCount = this.cache.size - this.config.maxSize;
        }
            this._cleanupLowPriorityEntries(excessCount); }
        }
        
        const afterStats: MemoryStats = { cacheSize: this.cache.size,
            memoryUsage: this._estimateMemoryUsage(,
    accessHistorySize: this.accessHistory.size ,}
        );
        return { before: beforeStats)
           , after: afterStats, };
            expiredEntriesRemoved: expiredCount,) }
            memoryFreed: `${parseInt(beforeStats.memoryUsage} - parseInt(afterStats.memoryUsage}) KB`;
            success: true;
        },
    }
    
    /**
     * ガベージコレクションを強制実行（可能な場合）
     */''
    forceGarbageCollection()';
            if (typeof, global !== 'undefined' && (global, as any).gc) { ''
                (global, as any).gc()';
                console.log('[CacheSystem] Forced, garbage collection);
                return true; }
            
            // ブラウザ環境では手動でのメモリ解放を試行
            this._manualMemoryCleanup();
            return true;

        } catch (error') {
            console.warn('[CacheSystem] Could not force garbage collection:', error);
            return false;
    
    /**
     * 手動メモリクリーンアップ
     */
    private _manualMemoryCleanup(): void { // 大きなオブジェクトの参照を削除
        const largeEntries: EntryWithSize[] = [],
        
        for(const [key, entry] of this.cache.entries() {
        
            const estimatedSize = this._estimateObjectSize(entry.value);
            if (estimatedSize > 10000) { // 10KB以上
        
        }
                largeEntries.push({ key, size: estimatedSize ,}
        }
        
        // サイズの大きい順にソート
        largeEntries.sort((a, b) => b.size - a.size);
        
        // 上位10%を削除
        const toDelete = largeEntries.slice(0, Math.ceil(largeEntries.length * 0.1);
        
        for (const { key ) of toDelete) {
            this.cache.delete(key);
            this.accessHistory.delete(key);
            this.stats.evictions++; }
        
        this.stats.size = this.cache.size;
    }
    
    /**
     * メモリ使用量の詳細レポートを取得
     */
    getMemoryReport(): MemoryReport { const report: MemoryReport = {
            overview: {
                totalMemoryUsage: this._estimateMemoryUsage(;
                cacheSize: this.cache.size);
                accessHistorySize: this.accessHistory.size),
    averageEntrySize: this.cache.size > 0 ? ' }'

                    `${Math.round(parseInt(this._estimateMemoryUsage(} / this.cache.size'}' KB` : '0 KB'
            };
            breakdown: { ''
                cacheEntries: '0 KB',
                accessHistory: '0 KB',
                metadata: '0 KB' ,};
            topLargestEntries: [],
    recommendations: [];
        },
        
        // エントリサイズの分析
        const entrySizes: EntryWithSize[] = [],
        let totalCacheSize = 0;
        
        for(const [key, entry] of this.cache.entries() {
        
            const size = this._estimateObjectSize(entry);
            entrySizes.push({ key, size );
        
        }
            totalCacheSize += size; }
        }
        
        // 上位10の大きなエントリ
        entrySizes.sort((a, b) => b.size - a.size);
        report.topLargestEntries = entrySizes.slice(0, 10).map(({ key, size ): LargestEntry => ({''
            key: key.length > 50 ? key.substring(0, 50) + '...' : key, 
            size: `${Math.round(size / 1024,}) KB`
        });
        // 詳細な内訳
        report.breakdown.cacheEntries = `${Math.round(totalCacheSize / 1024}) KB`;
        report.breakdown.accessHistory = `${Math.round(this.accessHistory.size * 16 / 1024}) KB`;
        report.breakdown.metadata = `${Math.round(48 / 1024}) KB`;
        
        // 推奨事項
        const memoryKB = parseInt(report.overview.totalMemoryUsage);''
        if(memoryKB > 5000) {', ';

        }

            report.recommendations.push('メモリ使用量が高いため、キャッシュサイズの削減を検討してください'; }'
        }

        if(this.cache.size > this.config.maxSize * 0.8) {', ';

        }

            report.recommendations.push('キャッシュサイズが上限に近づいています'; }'
        }
        
        const hitRate = this.stats.totalRequests > 0 ? ';

            (this.stats.hits / this.stats.totalRequests) * 100 : 0;''
        if(hitRate < 50) {', ';

        }

            report.recommendations.push('キャッシュヒット率が低いため、キャッシュ戦略の見直しを検討してください'; }'
        }
        
        return report;
    }
    
    /**
     * リソースを破棄（メモリリーク防止強化版）
     */
    destroy(): void { // タイマーを停止
        this._stopCleanupTimer();
        this._stopMemoryMonitoring();
        
        // キャッシュを段階的にクリア（大量データの場合のメモリ負荷軽減）
        const batchSize = 100;
        const keys = Array.from(this.cache.keys();
        
        for(let, i = 0; i < keys.length; i += batchSize) {
        
            const batch = keys.slice(i, i + batchSize);
            batch.forEach(key => { );
        
        }
                this.cache.delete(key); }
                this.accessHistory.delete(key); }
            });
            
            // 大量データの場合は少し待機
            if (keys.length > 1000 && i % (batchSize * 10) === 0) {
                setTimeout(() => {}, 0); // 次のイベントループに処理を移譲
            }
        }
        
        // 統計をリセット
        this.stats.size = 0;
        this.stats.hits = 0;
        this.stats.misses = 0;
        this.stats.evictions = 0;
        this.stats.expirations = 0;
        this.stats.totalRequests = 0;
        
        // 強制ガベージコレクション
        this.forceGarbageCollection();
    }
}

// シングルトンインスタンス
let instance: CacheSystem | null = null,

/**
 * CacheSystemのシングルトンインスタンスを取得
 */
function getCacheSystem(options: CacheOptions = {}): CacheSystem { if (!instance) {
        instance = new CacheSystem(options); } else if (Object.keys(options).length > 0) { // 既存インスタンスの設定を更新
        instance.updateConfig(options); }
    return instance;
}

export { CacheSystem,

    getCacheSystem'  }'

};