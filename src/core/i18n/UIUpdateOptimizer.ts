import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * UI更新最適化システム
 * 言語切り替え時のUI更新を効率的に管理し、パフォーマンスを最適化
 */

// 型定義
export interface UIUpdateOptions {
    priority?: PriorityLevel;
    forceImmediate?: boolean;
    animateChanges?: boolean;
    preserveState?: boolean;
    deferHidden?: HTMLElement[];
}

export interface UpdateResult {
    success: boolean;
    type?: UpdateType;
    elementsUpdated?: number;
    updateTime: number;
    error?: string;
    deferredElements?: number;
    batchCount?: number;
    batchResults?: BatchResult[];
}

export interface BatchResult {
    success: boolean;
    priority?: PriorityLevel;
    batchCount?: number;
    totalElements?: number;
    updateTime: number;
    error?: string;
    batchIndex?: number;
    elements?: number;
    batches?: BatchInfo[];
}

export interface BatchInfo {
    batchIndex: number;
    elements: number;
    updateTime: number;
}

export interface ElementMeasurement {
    rect: DOMRect;
    computedStyle: CSSStyleDeclaration;
    offsetWidth: number;
    offsetHeight: number;
    scrollWidth: number;
    scrollHeight: number;
    timestamp?: number;
}

export interface ElementUpdateSpec {
    element: HTMLElement;
    currentText: string;
    newText: string;
    measurement: ElementMeasurement;
    needsReflow: boolean;
    preserveState: boolean;
}

export interface ElementState {
    value?: string;
    selectionStart?: number;
    selectionEnd?: number;
}

export interface OptimizationStrategies {
    separateReadWrite: boolean;
    batchDOMOperations: boolean;
    useDocumentFragment: boolean;
    deferNonCritical: boolean;
    reuseElements: boolean;
    minimizeReflow: boolean;
    useVirtualDOM: boolean;
}

export interface PerformanceMetrics {
    updateCount: number;
    batchCount: number;
    averageUpdateTime: number;
    totalUpdateTime: number;
    reflowCount: number;
    repaintCount: number;
    cacheHitRate: number;
}

export interface UIUpdateStats {
    totalUpdates: number;
    batchedUpdates: number;
    immediateUpdates: number;
    cacheHits: number;
    cacheMisses: number;
    deferredUpdates: number;
    averageBatchSize: number;
    totalBatchTime: number;
}

export interface DetailedStats extends UIUpdateStats, PerformanceMetrics {
    cacheSize: number;
    visibleElements: number;
    deferredElements: number;
    strategiesEnabled: string[];
}

export interface UIOptimizerConfig {
    enabled?: boolean;
    batchMode?: boolean;
    maxBatchSize?: number;
    strategies?: Partial<OptimizationStrategies>;
}

export interface DeferredUpdateData {
    translationData: Record<string, string>;
    options: UIUpdateOptions;
}

export type PriorityLevel = 'critical' | 'high' | 'normal' | 'low';
export type UpdateType = 'immediate' | 'batched';

// HTMLElement の拡張
declare global {
    interface HTMLElement {
        _deferredUpdate?: DeferredUpdateData;
    }
}

export class UIUpdateOptimizer {
    // 基本設定
    private enabled: boolean;
    private batchMode: boolean;
    private batchDelay: number;
    private maxBatchSize: number;
    private priorityLevels: PriorityLevel[];

    // バッチ処理管理
    private pendingUpdates: Map<string, any>;
    private updateQueue: any[];
    private batchTimer: NodeJS.Timeout | null;
    private processingBatch: boolean;

    // DOM測定キャッシュ
    private measurementCache: Map<string, ElementMeasurement>;
    private layoutCache: Map<string, any>;
    private computedStyleCache: Map<string, any>;
    private cacheInvalidationTime: number;

    // 更新戦略
    private strategies: OptimizationStrategies;

    // パフォーマンス監視
    private performanceMetrics: PerformanceMetrics;

    // 要素プール
    private elementPool: Map<string, HTMLElement[]>;
    private pooledElements: Set<HTMLElement>;

    // Intersection Observer
    private intersectionObserver: IntersectionObserver | null;
    private visibleElements: Set<HTMLElement>;

    // Mutation Observer
    private mutationObserver: MutationObserver | null;
    private observedMutations: MutationRecord[];

    // 統計情報
    private stats: UIUpdateStats;

    constructor() {
        // 基本設定
        this.enabled = true;
        this.batchMode = true;
        this.batchDelay = 16; // 16ms (60fps)
        this.maxBatchSize = 100;
        this.priorityLevels = ['critical', 'high', 'normal', 'low'];
        
        // バッチ処理管理
        this.pendingUpdates = new Map<string, any>();
        this.updateQueue = [];
        this.batchTimer = null;
        this.processingBatch = false;
        
        // DOM測定キャッシュ
        this.measurementCache = new Map<string, ElementMeasurement>();
        this.layoutCache = new Map<string, any>();
        this.computedStyleCache = new Map<string, any>();
        this.cacheInvalidationTime = 5000; // 5秒
        
        // 更新戦略
        this.strategies = {
            separateReadWrite: true,
            batchDOMOperations: true,
            useDocumentFragment: true,
            deferNonCritical: true,
            reuseElements: true,
            minimizeReflow: true,
            useVirtualDOM: false // 将来の拡張用
        };

        // パフォーマンス監視
        this.performanceMetrics = {
            updateCount: 0,
            batchCount: 0,
            averageUpdateTime: 0,
            totalUpdateTime: 0,
            reflowCount: 0,
            repaintCount: 0,
            cacheHitRate: 0
        };

        // 要素プール
        this.elementPool = new Map<string, HTMLElement[]>();
        this.pooledElements = new Set<HTMLElement>();
        
        // Intersection Observer
        this.intersectionObserver = null;
        this.visibleElements = new Set<HTMLElement>();
        
        // Mutation Observer
        this.mutationObserver = null;
        this.observedMutations = [];
        
        // 統計情報
        this.stats = {
            totalUpdates: 0,
            batchedUpdates: 0,
            immediateUpdates: 0,
            cacheHits: 0,
            cacheMisses: 0,
            deferredUpdates: 0,
            averageBatchSize: 0,
            totalBatchTime: 0
        };
        
        // 初期化
        this.initialize();
        console.log('UIUpdateOptimizer initialized');
    }
    
    /**
     * 初期化
     */
    private initialize(): void {
        // Intersection Observer の設定
        this.setupIntersectionObserver();
        
        // Mutation Observer の設定
        this.setupMutationObserver();
        
        // パフォーマンス監視の開始
        this.startPerformanceMonitoring();
        
        // キャッシュクリーンアップの設定
        this.setupCacheCleanup();
    }
    
    /**
     * 言語切り替え時のUI更新を最適化
     */
    async optimizeLanguageSwitchUpdate(
        elements: HTMLElement[],
        translationData: Record<string, string>,
        options: UIUpdateOptions = {}
    ): Promise<UpdateResult> {
        const startTime = performance.now();
        
        try {
            const {
                priority = 'normal',
                forceImmediate = false,
                animateChanges = true,
                preserveState = true
            } = options;

            if (!this.enabled) {
                return this.processImmediateUpdate(elements, translationData, options);
            }
            
            this.stats.totalUpdates++;
            
            // 要素の可視性チェック
            const visibleElements = elements.filter(el => this.isElementVisible(el));
            const hiddenElements = elements.filter(el => !this.isElementVisible(el));
            
            // 緊急更新または少数の要素の場合は即座に処理
            if (forceImmediate || visibleElements.length <= 5) {
                return await this.processImmediateUpdate(visibleElements, translationData, {
                    ...options,
                    deferHidden: hiddenElements
                });
            }
            
            // バッチ処理
            return await this.processBatchedUpdate(visibleElements, translationData, {
                ...options,
                deferHidden: hiddenElements
            });

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'UI_UPDATE_OPTIMIZER_ERROR', {
                operation: 'optimizeLanguageSwitchUpdate',
                elementCount: elements.length
            });
            
            return {
                success: false,
                error: (error as Error).message,
                updateTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * 即座のUI更新を処理
     */
    private async processImmediateUpdate(
        elements: HTMLElement[],
        translationData: Record<string, string>,
        options: UIUpdateOptions = {}
    ): Promise<UpdateResult> {
        const startTime = performance.now();
        
        try {
            const { animateChanges, preserveState, deferHidden = [] } = options;
            
            this.stats.immediateUpdates++;
            
            // DOM読み取り操作をバッチ化
            const measurements = this.batchMeasureElements(elements);
            
            // DOM書き込み操作をバッチ化
            const updates = await this.prepareBatchUpdates(elements, translationData, measurements);
            
            // アニメーション準備
            if (animateChanges) {
                this.prepareUpdateAnimations(elements, updates);
            }
            
            // DOM更新を実行
            this.executeBatchUpdates(updates);
            
            // 隠れた要素の遅延更新をスケジュール
            if (deferHidden.length > 0) {
                this.scheduleDeferredUpdate(deferHidden, translationData, options);
            }
            
            const updateTime = performance.now() - startTime;
            this.updatePerformanceMetrics(updateTime, elements.length);

            console.log(`Immediate UI update completed in ${updateTime.toFixed(2)}ms for ${elements.length} elements`);
            
            return {
                success: true,
                type: 'immediate',
                elementsUpdated: elements.length,
                updateTime,
                deferredElements: deferHidden.length
            };

        } catch (error) {
            throw new Error(`Immediate update failed: ${(error as Error).message}`);
        }
    }
    
    /**
     * バッチUI更新を処理
     */
    private async processBatchedUpdate(
        elements: HTMLElement[],
        translationData: Record<string, string>,
        options: UIUpdateOptions = {}
    ): Promise<UpdateResult> {
        const startTime = performance.now();
        
        try {
            const { priority, animateChanges, deferHidden = [] } = options;
            
            this.stats.batchedUpdates++;
            
            // 優先度別にグループ化
            const priorityGroups = this.groupElementsByPriority(elements);
            
            // 優先度順に処理
            const results: BatchResult[] = [];
            for (const level of this.priorityLevels) {
                const group = priorityGroups.get(level);
                if (group && group.length > 0) {
                    const batchResult = await this.processPriorityBatch(group, translationData, {
                        ...options,
                        priority: level
                    });
                    results.push(batchResult);
                }
            }
            
            // 隠れた要素の遅延更新
            if (deferHidden.length > 0) {
                this.scheduleDeferredUpdate(deferHidden, translationData, options);
            }
            
            const totalUpdateTime = performance.now() - startTime;
            this.updatePerformanceMetrics(totalUpdateTime, elements.length);

            console.log(`Batched UI update completed in ${totalUpdateTime.toFixed(2)}ms for ${elements.length} elements`);
            
            return {
                success: true,
                type: 'batched',
                elementsUpdated: elements.length,
                batchCount: results.length,
                updateTime: totalUpdateTime,
                deferredElements: deferHidden.length,
                batchResults: results
            };

        } catch (error) {
            throw new Error(`Batched update failed: ${(error as Error).message}`);
        }
    }
    
    /**
     * 要素を優先度でグループ化
     */
    private groupElementsByPriority(elements: HTMLElement[]): Map<PriorityLevel, HTMLElement[]> {
        const groups = new Map<PriorityLevel, HTMLElement[]>();
        
        for (const level of this.priorityLevels) {
            groups.set(level, []);
        }
        
        for (const element of elements) {
            const priority = this.getElementPriority(element);
            const group = groups.get(priority) || groups.get('normal')!;
            group.push(element);
        }
        
        return groups;
    }
    
    /**
     * 要素の優先度を取得
     */
    private getElementPriority(element: HTMLElement): PriorityLevel {
        // データ属性での指定
        const dataPriority = element.dataset.updatePriority as PriorityLevel;
        if (dataPriority && this.priorityLevels.includes(dataPriority)) {
            return dataPriority;
        }
        
        // クラス名での判定
        if (element.classList.contains('critical')) return 'critical';
        if (element.classList.contains('high-priority')) return 'high';
        if (element.classList.contains('low-priority')) return 'low';
        
        // 要素タイプでの判定
        const tagPriority: Record<string, PriorityLevel> = {
            'H1': 'critical', 'H2': 'high', 'H3': 'high',
            'BUTTON': 'high', 'INPUT': 'high', 'LABEL': 'high',
            'P': 'normal', 'SPAN': 'normal', 'DIV': 'normal',
            'SMALL': 'low', 'FOOTER': 'low'
        };

        return tagPriority[element.tagName] || 'normal';
    }
    
    /**
     * 優先度バッチを処理
     */
    private async processPriorityBatch(
        elements: HTMLElement[],
        translationData: Record<string, string>,
        options: UIUpdateOptions
    ): Promise<BatchResult> {
        const startTime = performance.now();
        const { priority } = options;
        
        try {
            // バッチサイズを決定
            const batchSize = this.getBatchSizeForPriority(priority!);
            const batches = this.createUpdateBatches(elements, batchSize);
            
            // バッチを順次処理
            const batchResults: BatchInfo[] = [];
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                
                // DOM読み取り
                const measurements = this.batchMeasureElements(batch);
                // 更新準備
                const updates = await this.prepareBatchUpdates(batch, translationData, measurements);
                // DOM書き込み
                this.executeBatchUpdates(updates);
                
                batchResults.push({
                    batchIndex: i,
                    elements: batch.length,
                    updateTime: performance.now() - startTime
                });
                
                // 次のバッチまで待機（高優先度以外）
                if (priority !== 'critical' && i < batches.length - 1) {
                    await this.waitForNextFrame();
                }
            }
            
            return {
                success: true,
                priority,
                batchCount: batches.length,
                totalElements: elements.length,
                updateTime: performance.now() - startTime,
                batches: batchResults
            };

        } catch (error) {
            return {
                success: false,
                priority,
                error: (error as Error).message,
                updateTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * 優先度に応じたバッチサイズを取得
     */
    private getBatchSizeForPriority(priority: PriorityLevel): number {
        const batchSizes: Record<PriorityLevel, number> = {
            'critical': Math.floor(this.maxBatchSize * 0.3), // 30%
            'high': Math.floor(this.maxBatchSize * 0.5),     // 50%
            'normal': this.maxBatchSize,                     // 100%
            'low': Math.floor(this.maxBatchSize * 1.5)      // 150%
        };
        
        return batchSizes[priority] || this.maxBatchSize;
    }
    
    /**
     * 更新バッチを作成
     */
    private createUpdateBatches(elements: HTMLElement[], batchSize: number): HTMLElement[][] {
        const batches: HTMLElement[][] = [];
        for (let i = 0; i < elements.length; i += batchSize) {
            batches.push(elements.slice(i, i + batchSize));
        }
        return batches;
    }
    
    /**
     * 要素を一括測定
     */
    private batchMeasureElements(elements: HTMLElement[]): Map<HTMLElement, ElementMeasurement> {
        const measurements = new Map<HTMLElement, ElementMeasurement>();
        
        // DOM読み取り操作をまとめて実行
        for (const element of elements) {
            const cacheKey = this.getElementCacheKey(element);
            if (this.measurementCache.has(cacheKey)) {
                measurements.set(element, this.measurementCache.get(cacheKey)!);
                this.stats.cacheHits++;
            } else {
                const measurement: ElementMeasurement = {
                    rect: element.getBoundingClientRect(),
                    computedStyle: window.getComputedStyle(element),
                    offsetWidth: element.offsetWidth,
                    offsetHeight: element.offsetHeight,
                    scrollWidth: element.scrollWidth,
                    scrollHeight: element.scrollHeight
                };

                measurements.set(element, measurement);
                this.measurementCache.set(cacheKey, {
                    ...measurement,
                    timestamp: Date.now()
                });
                this.stats.cacheMisses++;
            }
        }
        
        return measurements;
    }
    
    /**
     * バッチ更新を準備
     */
    private async prepareBatchUpdates(
        elements: HTMLElement[],
        translationData: Record<string, string>,
        measurements: Map<HTMLElement, ElementMeasurement>
    ): Promise<ElementUpdateSpec[]> {
        const updates: ElementUpdateSpec[] = [];
        
        for (const element of elements) {
            const measurement = measurements.get(element);
            if (measurement) {
                const update = await this.prepareElementUpdate(element, translationData, measurement);
                if (update) {
                    updates.push(update);
                }
            }
        }
        
        return updates;
    }
    
    /**
     * 要素更新を準備
     */
    private async prepareElementUpdate(
        element: HTMLElement,
        translationData: Record<string, string>,
        measurement: ElementMeasurement
    ): Promise<ElementUpdateSpec | null> {
        try {
            // 翻訳キーを取得
            const translationKey = this.getTranslationKey(element);
            if (!translationKey) return null;
            
            // 翻訳データを取得
            const translatedText = translationData[translationKey];
            if (!translatedText) return null;
            
            // 現在のテキストと比較
            const currentText = this.getCurrentElementText(element);
            if (currentText === translatedText) return null;
            
            // 更新仕様を作成
            const updateSpec: ElementUpdateSpec = {
                element,
                currentText,
                newText: translatedText,
                measurement,
                needsReflow: this.needsReflow(element, currentText, translatedText, measurement),
                preserveState: this.shouldPreserveState(element)
            };
            
            return updateSpec;

        } catch (error) {
            console.warn('Failed to prepare element update:', error);
            return null;
        }
    }
    
    /**
     * バッチ更新を実行
     */
    private executeBatchUpdates(updates: ElementUpdateSpec[]): void {
        if (updates.length === 0) return;
        
        // Document Fragment を使用して効率的な更新
        if (this.strategies.useDocumentFragment) {
            this.executeBatchUpdatesWithFragment(updates);
        } else {
            this.executeBatchUpdatesDirectly(updates);
        }
        
        this.performanceMetrics.updateCount += updates.length;
        this.performanceMetrics.batchCount++;
    }
    
    /**
     * Document Fragmentを使用したバッチ更新
     */
    private executeBatchUpdatesWithFragment(updates: ElementUpdateSpec[]): void {
        const fragment = document.createDocumentFragment();
        
        for (const update of updates) {
            const { element, newText, preserveState } = update;
            
            // 状態保存
            let state: ElementState | undefined;
            if (preserveState) {
                state = this.saveElementState(element);
            }
            
            // テキスト更新
            this.updateElementText(element, newText);
            
            // 状態復元
            if (state) {
                this.restoreElementState(element, state);
            }
        }
    }
    
    /**
     * 直接的なバッチ更新
     */
    private executeBatchUpdatesDirectly(updates: ElementUpdateSpec[]): void {
        for (const update of updates) {
            const { element, newText, preserveState } = update;
            
            // 状態保存
            let state: ElementState | undefined;
            if (preserveState) {
                state = this.saveElementState(element);
            }
            
            // テキスト更新
            this.updateElementText(element, newText);
            
            // 状態復元
            if (state) {
                this.restoreElementState(element, state);
            }
        }
    }

    // ヘルパーメソッド（基本的な実装）
    private setupIntersectionObserver(): void {
        if (typeof IntersectionObserver !== 'undefined') {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.visibleElements.add(entry.target as HTMLElement);
                    } else {
                        this.visibleElements.delete(entry.target as HTMLElement);
                    }
                });
            });
        }
    }
    
    private setupMutationObserver(): void {
        if (typeof MutationObserver !== 'undefined') {
            this.mutationObserver = new MutationObserver((mutations) => {
                this.observedMutations.push(...mutations);
                this.invalidateCache();
            });
        }
    }
    
    private startPerformanceMonitoring(): void {
        // パフォーマンス監視の実装
        setInterval(() => {
            this.calculatePerformanceMetrics();
        }, 5000);
    }
    
    private setupCacheCleanup(): void {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, this.cacheInvalidationTime);
    }
    
    private isElementVisible(element: HTMLElement): boolean {
        return this.visibleElements.has(element) || element.offsetParent !== null;
    }
    
    private getElementCacheKey(element: HTMLElement): string {
        return `${element.tagName}-${element.id || ''}-${element.className || ''}`;
    }
    
    private getTranslationKey(element: HTMLElement): string | null {
        return element.dataset.i18nKey || element.getAttribute('data-i18n-key') || null;
    }
    
    private getCurrentElementText(element: HTMLElement): string {
        return element.textContent || element.innerText || '';
    }
    
    private needsReflow(element: HTMLElement, currentText: string, newText: string, measurement: ElementMeasurement): boolean {
        return currentText.length !== newText.length;
    }
    
    private shouldPreserveState(element: HTMLElement): boolean {
        return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable;
    }
    
    private saveElementState(element: HTMLElement): ElementState {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const input = element as HTMLInputElement;
            return {
                value: input.value,
                selectionStart: input.selectionStart || 0,
                selectionEnd: input.selectionEnd || 0
            };
        }
        return {};
    }
    
    private restoreElementState(element: HTMLElement, state: ElementState): void {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const input = element as HTMLInputElement;
            if (state.value !== undefined) input.value = state.value;
            if (state.selectionStart !== undefined && state.selectionEnd !== undefined) {
                input.setSelectionRange(state.selectionStart, state.selectionEnd);
            }
        }
    }
    
    private updateElementText(element: HTMLElement, text: string): void {
        if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'text') {
            (element as HTMLInputElement).placeholder = text;
        } else {
            element.textContent = text;
        }
    }
    
    private prepareUpdateAnimations(elements: HTMLElement[], updates: ElementUpdateSpec[]): void {
        // アニメーション準備の実装
        elements.forEach(element => {
            element.style.transition = 'opacity 0.3s ease';
        });
    }
    
    private scheduleDeferredUpdate(elements: HTMLElement[], translationData: Record<string, string>, options: UIUpdateOptions): void {
        this.stats.deferredUpdates += elements.length;
        // 遅延更新のスケジュール
        setTimeout(() => {
            this.processImmediateUpdate(elements, translationData, options);
        }, 100);
    }
    
    private updatePerformanceMetrics(updateTime: number, elementCount: number): void {
        this.performanceMetrics.totalUpdateTime += updateTime;
        this.performanceMetrics.updateCount += elementCount;
        this.performanceMetrics.averageUpdateTime = 
            this.performanceMetrics.totalUpdateTime / this.performanceMetrics.updateCount;
    }
    
    private waitForNextFrame(): Promise<void> {
        return new Promise(resolve => requestAnimationFrame(() => resolve()));
    }
    
    private invalidateCache(): void {
        this.measurementCache.clear();
        this.layoutCache.clear();
        this.computedStyleCache.clear();
    }
    
    private cleanupExpiredCache(): void {
        const now = Date.now();
        for (const [key, measurement] of this.measurementCache.entries()) {
            if (measurement.timestamp && now - measurement.timestamp > this.cacheInvalidationTime) {
                this.measurementCache.delete(key);
            }
        }
    }
    
    private calculatePerformanceMetrics(): void {
        if (this.stats.totalUpdates > 0) {
            this.performanceMetrics.cacheHitRate = 
                (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100;
        }
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<UIOptimizerConfig>): void {
        if (config.enabled !== undefined) this.enabled = config.enabled;
        if (config.batchMode !== undefined) this.batchMode = config.batchMode;
        if (config.maxBatchSize !== undefined) this.maxBatchSize = config.maxBatchSize;
        if (config.strategies) {
            this.strategies = { ...this.strategies, ...config.strategies };
        }
    }

    /**
     * 統計情報を取得
     */
    getStats(): DetailedStats {
        return {
            ...this.stats,
            ...this.performanceMetrics,
            cacheSize: this.measurementCache.size,
            visibleElements: this.visibleElements.size,
            deferredElements: 0,
            strategiesEnabled: Object.entries(this.strategies)
                .filter(([_, enabled]) => enabled)
                .map(([strategy]) => strategy)
        };
    }

    /**
     * リソースクリーンアップ
     */
    cleanup(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
        
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        this.invalidateCache();
        this.visibleElements.clear();
        this.pooledElements.clear();
        
        console.log('UIUpdateOptimizer cleaned up');
    }
}

// シングルトンインスタンス
let optimizerInstance: UIUpdateOptimizer | null = null;

/**
 * UIUpdateOptimizerのシングルトンインスタンスを取得
 */
export function getUIUpdateOptimizer(): UIUpdateOptimizer {
    if (!optimizerInstance) {
        optimizerInstance = new UIUpdateOptimizer();
    }
    return optimizerInstance;
}