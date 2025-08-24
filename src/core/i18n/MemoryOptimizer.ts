/**
 * MemoryOptimizer.ts
 * メモリ最適化システム
 * 翻訳データのメモリ効率的な管理と最適化を行う
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface MemoryOptimizerOptions {
    maxMemoryUsage?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    gcInterval?: number;
}

export interface MemoryUsage {
    translations: number;
    cache: number;
    metadata: number;
    other: number;
    total: number;
}

export interface OptimizationStrategies {
    stringDeduplication: boolean;
    objectPooling: boolean;
    lazyLoading: boolean;
    compressionThreshold: number;
    weakReferences: boolean;
}

export interface OptimizationStats {
    totalOptimizations: number;
    memoryFreed: number;
    stringsDeduped: number;
    objectsPooled: number;
    gcRuns: number;
    lastGcTime: number;
    averageGcTime: number;
    memoryPressureEvents: number;
}

export interface MemoryReport {
    timestamp: string;
    memoryUsage: MemoryUsage & {
        usagePercent: number;
        maxMemoryMB: number;
        totalMB: number;
        isUnderPressure: boolean;
        stringPoolSize: number;
        translationPoolSize: number;
        weakReferencesCount: number;
    };
    optimizations: {
        total: number;
        stringsDeduped: number;
        objectsPooled: number;
        memoryFreedMB: number;
    };
    performance: {
        averageGcTime: number;
        lastGcTime: number;
        gcFrequency: number;
    };
    recommendations: string[];
}

export interface DetailedStats extends OptimizationStats {
    memoryUsage: MemoryUsage & {
        usagePercent: number;
        maxMemoryMB: number;
        totalMB: number;
        isUnderPressure: boolean;
        stringPoolSize: number;
        translationPoolSize: number;
        weakReferencesCount: number;
    };
    optimizationStrategies: OptimizationStrategies;
    thresholds: {
        warning: number;
        critical: number;
    };
    performance: {
        averageGcTime: number;
        lastGcTime: number;
        gcFrequency: number;
    };
}

export interface ObjectReference {
    language: string;
    createdAt: number;
    weakRef?: WeakRef<any>;
}

export type MemoryPressureLevel = 'warning' | 'critical' | 'recovered';
export type MemoryPressureHandler = (level: MemoryPressureLevel) => void;

// WeakRef 型定義補完
declare global {
    interface Window {
        gc?: () => void;
    }
    
    class WeakRef<T extends object> {
        constructor(target: T);
        deref(): T | undefined;
    }
}

/**
 * メモリ最適化システムクラス
 */
export class MemoryOptimizer {
    // 基本設定
    private maxMemoryUsage: number;
    private warningThreshold: number;
    private criticalThreshold: number;
    private gcInterval: number;
    private gcIntervalId: number | null;
    
    // メモリ追跡
    private memoryUsage: MemoryUsage;
    
    // オブジェクト参照管理
    private objectReferences: WeakMap<object, ObjectReference>;
    private stringPool: Map<string, string>;
    private translationPool: Map<string, any>;
    
    // 最適化戦略
    private optimizationStrategies: OptimizationStrategies;
    
    // 統計情報
    private stats: OptimizationStats;
    
    // メモリ圧迫対応
    private memoryPressureHandlers: Set<MemoryPressureHandler>;
    private isUnderMemoryPressure: boolean;
    
    // パフォーマンス監視
    private performanceObserver: PerformanceObserver | null;

    constructor(options: MemoryOptimizerOptions = {}) {
        // 基本設定
        this.maxMemoryUsage = options.maxMemoryUsage || 50 * 1024 * 1024; // 50MB
        this.warningThreshold = options.warningThreshold || 0.8; // 80%で警告
        this.criticalThreshold = options.criticalThreshold || 0.95; // 95%で緊急対応
        this.gcInterval = options.gcInterval || 30000; // 30秒間隔でGC
        this.gcIntervalId = null;
        
        // メモリ追跡
        this.memoryUsage = {
            translations: 0,
            cache: 0,
            metadata: 0,
            other: 0,
            total: 0
        };
        
        // オブジェクト参照管理
        this.objectReferences = new WeakMap<object, ObjectReference>();
        this.stringPool = new Map<string, string>();
        this.translationPool = new Map<string, any>();
        
        // 最適化戦略
        this.optimizationStrategies = {
            stringDeduplication: true,
            objectPooling: true,
            lazyLoading: true,
            compressionThreshold: 1024, // 1KB
            weakReferences: true
        };
        
        // 統計情報
        this.stats = {
            totalOptimizations: 0,
            memoryFreed: 0,
            stringsDeduped: 0,
            objectsPooled: 0,
            gcRuns: 0,
            lastGcTime: 0,
            averageGcTime: 0,
            memoryPressureEvents: 0
        };
        
        // メモリ圧迫対応
        this.memoryPressureHandlers = new Set<MemoryPressureHandler>();
        this.isUnderMemoryPressure = false;
        
        // パフォーマンス監視
        this.performanceObserver = null;
        this.setupPerformanceObserver();
        
        // 定期的なガベージコレクション
        this.startPeriodicGC();
        
        console.log('MemoryOptimizer initialized with', Math.round(this.maxMemoryUsage / 1024 / 1024), 'MB limit');
    }
    
    /**
     * 翻訳データを最適化
     */
    optimizeTranslationData(data: any, language: string): any {
        const startTime = performance.now();
        let optimized = data;
        
        try {
            // 文字列重複排除
            if (this.optimizationStrategies.stringDeduplication) {
                optimized = this._deduplicateStrings(optimized, language);
            }
            
            // オブジェクトプーリング
            if (this.optimizationStrategies.objectPooling) {
                optimized = this._applyObjectPooling(optimized, language);
            }
            
            // 弱参照の活用
            if (this.optimizationStrategies.weakReferences) {
                this._registerWeakReferences(optimized, language);
            }
            
            // メモリ使用量を更新
            this._updateMemoryUsage('translations', this._calculateObjectSize(optimized));
            
            const optimizationTime = performance.now() - startTime;
            this.stats.totalOptimizations++;
            
            console.log(`Translation data optimized for ${language} in ${optimizationTime.toFixed(2)}ms`);
            
            return optimized;
        } catch (error) {
            console.error('Translation optimization failed:', error);
            return data;
        }
    }
    
    /**
     * 文字列重複排除
     */
    private _deduplicateStrings(data: any, language: string): any {
        const deduped: any = {};
        
        const processValue = (value: any): any => {
            if (typeof value === 'string') {
                // 既存の文字列プールをチェック
                if (this.stringPool.has(value)) {
                    this.stats.stringsDeduped++;
                    return this.stringPool.get(value);
                }
                
                // 新しい文字列をプールに追加
                this.stringPool.set(value, value);
                return value;
            }
            
            if (Array.isArray(value)) {
                return value.map(processValue);
            }
            
            if (typeof value === 'object' && value !== null) {
                const processed: any = {};
                for (const [key, val] of Object.entries(value)) {
                    processed[key] = processValue(val);
                }
                return processed;
            }
            
            return value;
        };
        
        for (const [key, value] of Object.entries(data)) {
            deduped[key] = processValue(value);
        }
        
        return deduped;
    }
    
    /**
     * オブジェクトプーリングを適用
     */
    private _applyObjectPooling(data: any, language: string): any {
        const poolKey = `translations_${language}`;
        
        // 既存のプールをチェック
        if (this.translationPool.has(poolKey)) {
            const existingPool = this.translationPool.get(poolKey);
            // 類似したオブジェクト構造を再利用
            const optimized = this._reuseObjectStructures(data, existingPool);
            this.stats.objectsPooled++;
            return optimized;
        }
        
        // 新しいプールを作成
        this.translationPool.set(poolKey, this._createObjectPool(data));
        return data;
    }
    
    /**
     * オブジェクト構造の再利用
     */
    private _reuseObjectStructures(data: any, pool: any[]): any {
        const reused: any = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // 類似した構造がプールにあるかチェック
                const similar = this._findSimilarStructure(value, pool);
                if (similar) {
                    reused[key] = { ...similar, ...value };
                } else {
                    reused[key] = value;
                    pool.push(value); // プールに追加
                }
            } else {
                reused[key] = value;
            }
        }
        
        return reused;
    }
    
    /**
     * 類似構造を検索
     */
    private _findSimilarStructure(target: any, pool: any[]): any | null {
        const targetKeys = Object.keys(target).sort();
        
        for (const poolItem of pool) {
            if (typeof poolItem !== 'object' || poolItem === null) continue;
            
            const poolKeys = Object.keys(poolItem).sort();
            // キーの60%以上が一致する場合は類似とみなす
            const matchingKeys = targetKeys.filter(key => poolKeys.includes(key));
            const similarity = matchingKeys.length / Math.max(targetKeys.length, poolKeys.length);
            
            if (similarity >= 0.6) {
                return poolItem;
            }
        }
        
        return null;
    }
    
    /**
     * オブジェクトプールを作成
     */
    private _createObjectPool(data: any): any[] {
        const pool: any[] = [];
        
        const collectObjects = (obj: any): void => {
            if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                pool.push(obj);
                for (const value of Object.values(obj)) {
                    collectObjects(value);
                }
            } else if (Array.isArray(obj)) {
                obj.forEach(collectObjects);
            }
        };
        
        collectObjects(data);
        return pool;
    }
    
    /**
     * 弱参照を登録
     */
    private _registerWeakReferences(data: any, language: string): void {
        if (typeof WeakRef !== 'undefined') {
            const weakRef = new WeakRef(data);
            this.objectReferences.set(data, {
                language,
                createdAt: Date.now(),
                weakRef
            });
        }
    }
    
    /**
     * メモリ使用量を更新
     */
    private _updateMemoryUsage(category: keyof MemoryUsage, size: number): void {
        if (category !== 'total') {
            this.memoryUsage[category] = size;
        }
        
        this.memoryUsage.total = Object.entries(this.memoryUsage)
            .filter(([key, val]) => key !== 'total' && typeof val === 'number')
            .reduce((sum, [, val]) => sum + (val as number), 0);
        
        // メモリ圧迫チェック
        this._checkMemoryPressure();
    }
    
    /**
     * メモリ圧迫をチェック
     */
    private _checkMemoryPressure(): void {
        const usageRatio = this.memoryUsage.total / this.maxMemoryUsage;
        
        if (usageRatio >= this.criticalThreshold) {
            this._handleCriticalMemoryPressure();
        } else if (usageRatio >= this.warningThreshold && !this.isUnderMemoryPressure) {
            this._handleMemoryWarning();
        } else if (usageRatio < this.warningThreshold && this.isUnderMemoryPressure) {
            this._handleMemoryRecovery();
        }
    }
    
    /**
     * 緊急メモリ圧迫への対応
     */
    private _handleCriticalMemoryPressure(): void {
        console.warn('Critical memory pressure detected, initiating emergency cleanup');
        
        this.isUnderMemoryPressure = true;
        this.stats.memoryPressureEvents++;
        
        // 緊急クリーンアップ
        this._performEmergencyCleanup();
        
        // 圧迫ハンドラーを実行
        for (const handler of this.memoryPressureHandlers) {
            try {
                handler('critical');
            } catch (error) {
                console.error('Memory pressure handler failed:', error);
            }
        }
    }
    
    /**
     * メモリ警告への対応
     */
    private _handleMemoryWarning(): void {
        console.warn('Memory usage exceeds warning threshold');
        
        this.isUnderMemoryPressure = true;
        
        // プリエンプティブクリーンアップ
        this._performPreemptiveCleanup();
        
        // 警告ハンドラーを実行
        for (const handler of this.memoryPressureHandlers) {
            try {
                handler('warning');
            } catch (error) {
                console.error('Memory pressure handler failed:', error);
            }
        }
    }
    
    /**
     * メモリ回復への対応
     */
    private _handleMemoryRecovery(): void {
        console.log('Memory pressure relieved');
        
        this.isUnderMemoryPressure = false;
        
        // 回復ハンドラーを実行
        for (const handler of this.memoryPressureHandlers) {
            try {
                handler('recovered');
            } catch (error) {
                console.error('Memory pressure handler failed:', error);
            }
        }
    }
    
    /**
     * 緊急クリーンアップ
     */
    private _performEmergencyCleanup(): void {
        const startSize = this.memoryUsage.total;
        
        // 文字列プールをクリア
        this.stringPool.clear();
        
        // 翻訳プールを部分的にクリア
        const poolEntries = Array.from(this.translationPool.entries());
        const toKeep = Math.ceil(poolEntries.length * 0.3); // 30%保持
        
        this.translationPool.clear();
        poolEntries.slice(0, toKeep).forEach(([key, value]) => {
            this.translationPool.set(key, value);
        });
        
        // ガベージコレクションを強制実行
        this._forceGarbageCollection();
        
        const freedMemory = startSize - this.memoryUsage.total;
        this.stats.memoryFreed += freedMemory;
        
        console.log(`Emergency cleanup freed ${Math.round(freedMemory / 1024)}KB`);
    }
    
    /**
     * プリエンプティブクリーンアップ
     */
    private _performPreemptiveCleanup(): void {
        // 古い文字列プールエントリを削除
        if (this.stringPool.size > 1000) {
            const entries = Array.from(this.stringPool.entries());
            this.stringPool.clear();
            // 最新の70%を保持
            const toKeep = Math.ceil(entries.length * 0.7);
            entries.slice(-toKeep).forEach(([key, value]) => {
                this.stringPool.set(key, value);
            });
        }
        
        // 弱参照をクリーンアップ
        this._cleanupWeakReferences();
    }
    
    /**
     * 弱参照をクリーンアップ
     */
    private _cleanupWeakReferences(): void {
        if (typeof WeakRef === 'undefined') return;
        
        const toDelete: object[] = [];
        
        for (const [obj, info] of this.objectReferences) {
            if (info.weakRef && info.weakRef.deref() === undefined) {
                toDelete.push(obj);
            }
        }
        
        toDelete.forEach(obj => {
            this.objectReferences.delete(obj);
        });
        
        if (toDelete.length > 0) {
            console.log(`Cleaned up ${toDelete.length} weak references`);
        }
    }
    
    /**
     * ガベージコレクションを強制実行
     */
    private _forceGarbageCollection(): void {
        const startTime = performance.now();
        
        // ブラウザのGCを促す（確実ではない）
        if (window.gc) {
            window.gc();
        } else {
            // GCを促すための大きなオブジェクト作成と削除
            for (let i = 0; i < 10; i++) {
                const temp = new Array(100000).fill('temp');
                temp.length = 0;
            }
        }
        
        const gcTime = performance.now() - startTime;
        this.stats.gcRuns++;
        this.stats.lastGcTime = gcTime;
        this.stats.averageGcTime = (this.stats.averageGcTime * (this.stats.gcRuns - 1) + gcTime) / this.stats.gcRuns;
        
        console.log(`Garbage collection completed in ${gcTime.toFixed(2)}ms`);
    }
    
    /**
     * オブジェクトサイズを計算
     */
    private _calculateObjectSize(obj: any): number {
        try {
            // 簡易的なサイズ計算
            const jsonString = JSON.stringify(obj);
            return new Blob([jsonString]).size;
        } catch (error) {
            console.warn('Failed to calculate object size:', error);
            return 0;
        }
    }
    
    /**
     * パフォーマンスオブザーバーを設定
     */
    private setupPerformanceObserver(): void {
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    for (const entry of entries) {
                        if (entry.entryType === 'measure' && entry.name.includes('memory')) {
                            this._analyzeMemoryPerformance(entry);
                        }
                    }
                });

                this.performanceObserver.observe({
                    entryTypes: ['measure', 'navigation']
                });
            } catch (error) {
                console.warn('Performance observer setup failed:', error);
            }
        }
    }
    
    /**
     * メモリパフォーマンスを分析
     */
    private _analyzeMemoryPerformance(entry: PerformanceEntry): void {
        if (entry.duration > 100) { // 100ms以上の処理
            console.warn(`Slow memory operation detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
    }
    
    /**
     * 定期的なガベージコレクションを開始
     */
    private startPeriodicGC(): void {
        this.gcIntervalId = window.setInterval(() => {
            if (!this.isUnderMemoryPressure) {
                this._performMaintenanceGC();
            }
        }, this.gcInterval);
    }
    
    /**
     * メンテナンス用ガベージコレクション
     */
    private _performMaintenanceGC(): void {
        // 軽量なクリーンアップ
        this._cleanupWeakReferences();
        
        // 文字列プールの最適化
        if (this.stringPool.size > 5000) {
            const entries = Array.from(this.stringPool.entries());
            this.stringPool.clear();
            // 使用頻度の高いもの（最新の80%）を保持
            const toKeep = Math.ceil(entries.length * 0.8);
            entries.slice(-toKeep).forEach(([key, value]) => {
                this.stringPool.set(key, value);
            });
        }
    }
    
    /**
     * メモリ圧迫ハンドラーを追加
     */
    addMemoryPressureHandler(handler: MemoryPressureHandler): boolean {
        if (typeof handler === 'function') {
            this.memoryPressureHandlers.add(handler);
            return true;
        }
        return false;
    }
    
    /**
     * メモリ圧迫ハンドラーを削除
     */
    removeMemoryPressureHandler(handler: MemoryPressureHandler): boolean {
        return this.memoryPressureHandlers.delete(handler);
    }
    
    /**
     * メモリ使用状況を取得
     */
    getMemoryUsage(): MemoryUsage & {
        usagePercent: number;
        maxMemoryMB: number;
        totalMB: number;
        isUnderPressure: boolean;
        stringPoolSize: number;
        translationPoolSize: number;
        weakReferencesCount: number;
    } {
        return {
            ...this.memoryUsage,
            usagePercent: Math.round((this.memoryUsage.total / this.maxMemoryUsage) * 10000) / 100,
            maxMemoryMB: Math.round(this.maxMemoryUsage / 1024 / 1024),
            totalMB: Math.round(this.memoryUsage.total / 1024 / 1024),
            isUnderPressure: this.isUnderMemoryPressure,
            stringPoolSize: this.stringPool.size,
            translationPoolSize: this.translationPool.size,
            weakReferencesCount: this.objectReferences ? 1 : 0 // WeakMap.size is not available
        };
    }
    
    /**
     * 詳細統計を取得
     */
    getDetailedStats(): DetailedStats {
        const memoryUsage = this.getMemoryUsage();
        return {
            ...this.stats,
            memoryUsage,
            optimizationStrategies: this.optimizationStrategies,
            thresholds: {
                warning: this.warningThreshold,
                critical: this.criticalThreshold
            },
            performance: {
                averageGcTime: Math.round(this.stats.averageGcTime * 100) / 100,
                lastGcTime: Math.round(this.stats.lastGcTime * 100) / 100,
                gcFrequency: this.stats.gcRuns / Math.max((Date.now() - this.stats.lastGcTime) / 1000, 1)
            }
        };
    }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config: Partial<MemoryOptimizerOptions & { optimizationStrategies: Partial<OptimizationStrategies> }>): void {
        if (config.maxMemoryUsage !== undefined) {
            this.maxMemoryUsage = config.maxMemoryUsage;
        }
        
        if (config.warningThreshold !== undefined) {
            this.warningThreshold = config.warningThreshold;
        }
        
        if (config.criticalThreshold !== undefined) {
            this.criticalThreshold = config.criticalThreshold;
        }

        if (config.optimizationStrategies) {
            this.optimizationStrategies = {
                ...this.optimizationStrategies,
                ...config.optimizationStrategies
            };
        }

        console.log('MemoryOptimizer configuration updated:', config);
    }
    
    /**
     * 最適化レポートを生成
     */
    generateOptimizationReport(): MemoryReport {
        const stats = this.getDetailedStats();
        const report: MemoryReport = {
            timestamp: new Date().toISOString(),
            memoryUsage: stats.memoryUsage,
            optimizations: {
                total: stats.totalOptimizations,
                stringsDeduped: stats.stringsDeduped,
                objectsPooled: stats.objectsPooled,
                memoryFreedMB: Math.round(stats.memoryFreed / 1024 / 1024)
            },
            performance: stats.performance,
            recommendations: []
        };
        
        // 推奨事項を生成
        if (stats.memoryUsage.usagePercent > 80) {
            report.recommendations.push('Consider increasing memory limit or improving cleanup frequency');
        }

        if (stats.performance.averageGcTime > 50) {
            report.recommendations.push('Garbage collection is taking too long, consider optimizing object lifecycle');
        }

        if (stats.stringsDeduped / Math.max(stats.totalOptimizations, 1) > 0.5) {
            report.recommendations.push('High string duplication detected, consider improving string management');
        }
        
        return report;
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        // 定期GCを停止
        if (this.gcIntervalId) {
            clearInterval(this.gcIntervalId);
        }
        
        // パフォーマンスオブザーバーを停止
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        // 全データをクリア
        this.stringPool.clear();
        this.translationPool.clear();
        this.objectReferences = new WeakMap();
        this.memoryPressureHandlers.clear();
        
        console.log('MemoryOptimizer cleaned up');
    }
}

// シングルトンインスタンス
let memoryOptimizerInstance: MemoryOptimizer | null = null;

/**
 * MemoryOptimizerのシングルトンインスタンスを取得
 */
export function getMemoryOptimizer(): MemoryOptimizer {
    if (!memoryOptimizerInstance) {
        memoryOptimizerInstance = new MemoryOptimizer();
    }
    return memoryOptimizerInstance;
}