import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * UI更新最適化システム
 * 言語切り替え時のUI更新を効率的に管理し、パフォーマンスを最適化
 */
export class UIUpdateOptimizer {
    constructor() {
        // 基本設定
        this.enabled = true;
        this.batchMode = true;
        this.batchDelay = 16; // 16ms (60fps)
        this.maxBatchSize = 100;
        this.priorityLevels = ['critical', 'high', 'normal', 'low'];
        
        // バッチ処理管理
        this.pendingUpdates = new Map();
        this.updateQueue = [];
        this.batchTimer = null;
        this.processingBatch = false;
        
        // DOM測定キャッシュ
        this.measurementCache = new Map();
        this.layoutCache = new Map();
        this.computedStyleCache = new Map();
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
        this.elementPool = new Map();
        this.pooledElements = new Set();
        
        // Intersection Observer
        this.intersectionObserver = null;
        this.visibleElements = new Set();
        
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
    initialize() {
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
    async optimizeLanguageSwitchUpdate(elements, translationData, options = {}) {
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
            getErrorHandler().handleError(error, 'UI_UPDATE_OPTIMIZER_ERROR', {
                operation: 'optimizeLanguageSwitchUpdate',
                elementCount: elements.length
            });
            
            return {
                success: false,
                error: error.message,
                updateTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * 即座のUI更新を処理
     */
    async processImmediateUpdate(elements, translationData, options = {}) {
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
            throw new Error(`Immediate update failed: ${error.message}`);
        }
    }
    
    /**
     * バッチUI更新を処理
     */
    async processBatchedUpdate(elements, translationData, options = {}) {
        const startTime = performance.now();
        
        try {
            const { priority, animateChanges, deferHidden = [] } = options;
            
            this.stats.batchedUpdates++;
            
            // 優先度別にグループ化
            const priorityGroups = this.groupElementsByPriority(elements);
            
            // 優先度順に処理
            const results = [];
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
            throw new Error(`Batched update failed: ${error.message}`);
        }
    }
    
    /**
     * 要素を優先度でグループ化
     */
    groupElementsByPriority(elements) {
        const groups = new Map();
        
        for (const level of this.priorityLevels) {
            groups.set(level, []);
        }
        
        for (const element of elements) {
            const priority = this.getElementPriority(element);
            const group = groups.get(priority) || groups.get('normal');
            group.push(element);
        }
        
        return groups;
    }
    
    /**
     * 要素の優先度を取得
     */
    getElementPriority(element) {
        // データ属性での指定
        const dataPriority = element.dataset.updatePriority;
        if (dataPriority && this.priorityLevels.includes(dataPriority)) {
            return dataPriority;
        }
        
        // クラス名での判定
        if (element.classList.contains('critical')) return 'critical';
        if (element.classList.contains('high-priority')) return 'high';
        if (element.classList.contains('low-priority')) return 'low';
        
        // 要素タイプでの判定
        const tagPriority = {
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
    async processPriorityBatch(elements, translationData, options) {
        const startTime = performance.now();
        const { priority } = options;
        
        try {
            // バッチサイズを決定
            const batchSize = this.getBatchSizeForPriority(priority);
            const batches = this.createUpdateBatches(elements, batchSize);
            
            // バッチを順次処理
            const batchResults = [];
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
                error: error.message,
                updateTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * 優先度に応じたバッチサイズを取得
     */
    getBatchSizeForPriority(priority) {
        const batchSizes = {
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
    createUpdateBatches(elements, batchSize) {
        const batches = [];
        for (let i = 0; i < elements.length; i += batchSize) {
            batches.push(elements.slice(i, i + batchSize));
        }
        return batches;
    }
    
    /**
     * 要素を一括測定
     */
    batchMeasureElements(elements) {
        const measurements = new Map();
        
        // DOM読み取り操作をまとめて実行
        for (const element of elements) {
            const cacheKey = this.getElementCacheKey(element);
            
            if (this.measurementCache.has(cacheKey)) {
                measurements.set(element, this.measurementCache.get(cacheKey));
                this.stats.cacheHits++;
            } else {
                const measurement = {
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
    async prepareBatchUpdates(elements, translationData, measurements) {
        const updates = [];
        
        for (const element of elements) {
            const measurement = measurements.get(element);
            const update = await this.prepareElementUpdate(element, translationData, measurement);
            
            if (update) {
                updates.push(update);
            }
        }
        
        return updates;
    }
    
    /**
     * 要素更新を準備
     */
    async prepareElementUpdate(element, translationData, measurement) {
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
            const updateSpec = {
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
    executeBatchUpdates(updates) {
        if (updates.length === 0) return;
        
        // Document Fragment を使用して効率的な更新
        if (this.strategies.useDocumentFragment && updates.length > 10) {
            this.executeBatchUpdatesWithFragment(updates);
        } else {
            this.executeBatchUpdatesDirectly(updates);
        }
        
        this.performanceMetrics.batchCount++;
        this.stats.batchedUpdates += updates.length;
    }
    
    /**
     * Document Fragment を使用してバッチ更新を実行
     */
    executeBatchUpdatesWithFragment(updates) {
        // リフローが必要な更新と不要な更新を分離
        const reflowUpdates = updates.filter(update => update.needsReflow);
        const nonReflowUpdates = updates.filter(update => !update.needsReflow);
        
        // リフローが不要な更新を先に処理
        for (const update of nonReflowUpdates) {
            this.applyElementUpdate(update);
        }
        
        // リフローが必要な更新をバッチ処理
        if (reflowUpdates.length > 0) {
            // contain: layout を一時的に適用
            document.documentElement.style.contain = 'layout';
            
            for (const update of reflowUpdates) {
                this.applyElementUpdate(update);
            }
            
            // 次のフレームで contain を解除
            requestAnimationFrame(() => {
                document.documentElement.style.contain = '';
            });
            
            this.performanceMetrics.reflowCount++;
        }
    }
    
    /**
     * 直接バッチ更新を実行
     */
    executeBatchUpdatesDirectly(updates) {
        for (const update of updates) {
            this.applyElementUpdate(update);
        }
    }
    
    /**
     * 要素更新を適用
     */
    applyElementUpdate(update) {
        const { element, newText, preserveState } = update;
        
        try {
            // 状態保持が必要な場合
            if (preserveState) {
                const state = this.captureElementState(element);
                element.textContent = newText;
                this.restoreElementState(element, state);
            } else {
                element.textContent = newText;
            }
            
            // カスタムイベントを発火
            element.dispatchEvent(new CustomEvent('textUpdated', {
                detail: { oldText: update.currentText, newText }
            }));
            
        } catch (error) {
            console.warn('Failed to apply element update:', error);
        }
    }
    
    /**
     * 更新アニメーションを準備
     */
    prepareUpdateAnimations(elements, updates) {
        for (const update of updates) {
            if (update.newText !== update.currentText) {
                // 簡単なフェードアニメーション
                const element = update.element;
                element.style.transition = 'opacity 0.15s ease-out';
                element.style.opacity = '0.7';
                
                // テキスト更新後にアニメーション復帰
                setTimeout(() => {
                    element.style.opacity = '1';
                    setTimeout(() => {
                        element.style.transition = '';
                    }, 150);
                }, 50);
            }
        }
    }
    
    /**
     * 遅延更新をスケジュール
     */
    scheduleDeferredUpdate(elements, translationData, options) {
        this.stats.deferredUpdates += elements.length;
        
        // Intersection Observer で可視になったときに更新
        for (const element of elements) {
            if (this.intersectionObserver) {
                this.intersectionObserver.observe(element);
                
                // 遅延更新データを保存
                element._deferredUpdate = {
                    translationData,
                    options: { ...options, forceImmediate: true }
                };
            }
        }
    }
    
    /**
     * 要素の可視性をチェック
     */
    isElementVisible(element) {
        if (this.visibleElements.has(element)) return true;
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    /**
     * リフローが必要かチェック
     */
    needsReflow(element, oldText, newText, measurement) {
        const lengthRatio = newText.length / Math.max(oldText.length, 1);
        
        // テキスト長が大幅に変わる場合
        if (lengthRatio < 0.5 || lengthRatio > 2.0) return true;
        
        // 固定幅の要素の場合
        const computedStyle = measurement.computedStyle;
        if (computedStyle.width !== 'auto' && computedStyle.whiteSpace === 'nowrap') {
            return true;
        }
        
        return false;
    }
    
    /**
     * 状態保持が必要かチェック
     */
    shouldPreserveState(element) {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' ||
               element.contentEditable === 'true';
    }
    
    /**
     * 翻訳キーを取得
     */
    getTranslationKey(element) {
        return element.dataset.i18nKey || 
               element.getAttribute('data-translate') ||
               element.className.match(/i18n-(\S+)/)?.[1];
    }
    
    /**
     * 現在の要素テキストを取得
     */
    getCurrentElementText(element) {
        return element.textContent || element.innerText || '';
    }
    
    /**
     * 要素の状態をキャプチャ
     */
    captureElementState(element) {
        if (element.tagName === 'INPUT') {
            return {
                value: element.value,
                selectionStart: element.selectionStart,
                selectionEnd: element.selectionEnd
            };
        }
        
        return null;
    }
    
    /**
     * 要素の状態を復元
     */
    restoreElementState(element, state) {
        if (state && element.tagName === 'INPUT') {
            element.value = state.value;
            element.setSelectionRange(state.selectionStart, state.selectionEnd);
        }
    }
    
    /**
     * 要素キャッシュキーを生成
     */
    getElementCacheKey(element) {
        return `${element.tagName}:${element.className}:${element.id}:${element.textContent?.substring(0, 30)}`;
    }
    
    /**
     * 次のフレームまで待機
     */
    waitForNextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    /**
     * Intersection Observer を設定
     */
    setupIntersectionObserver() {
        if (typeof IntersectionObserver !== 'undefined') {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    const element = entry.target;
                    
                    if (entry.isIntersecting) {
                        this.visibleElements.add(element);
                        
                        // 遅延更新があれば実行
                        if (element._deferredUpdate) {
                            const { translationData, options } = element._deferredUpdate;
                            this.optimizeLanguageSwitchUpdate([element], translationData, options);
                            delete element._deferredUpdate;
                            this.intersectionObserver.unobserve(element);
                        }
                    } else {
                        this.visibleElements.delete(element);
                    }
                }
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
        }
    }
    
    /**
     * Mutation Observer を設定
     */
    setupMutationObserver() {
        if (typeof MutationObserver !== 'undefined') {
            this.mutationObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        // キャッシュを無効化
                        const element = mutation.target;
                        const cacheKey = this.getElementCacheKey(element);
                        this.measurementCache.delete(cacheKey);
                    }
                }
            });
            
            this.mutationObserver.observe(document.body, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    }
    
    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring() {
        // ResizeObserver での監視
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                // リサイズ時にキャッシュをクリア
                this.measurementCache.clear();
            });
            
            resizeObserver.observe(document.body);
        }
    }
    
    /**
     * キャッシュクリーンアップを設定
     */
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            
            for (const [key, data] of this.measurementCache) {
                if (now - data.timestamp > this.cacheInvalidationTime) {
                    this.measurementCache.delete(key);
                }
            }
        }, this.cacheInvalidationTime);
    }
    
    /**
     * パフォーマンスメトリクスを更新
     */
    updatePerformanceMetrics(updateTime, elementCount) {
        this.performanceMetrics.updateCount++;
        this.performanceMetrics.totalUpdateTime += updateTime;
        this.performanceMetrics.averageUpdateTime = 
            this.performanceMetrics.totalUpdateTime / this.performanceMetrics.updateCount;
            
        // キャッシュヒット率を計算
        const totalCacheAccess = this.stats.cacheHits + this.stats.cacheMisses;
        this.performanceMetrics.cacheHitRate = totalCacheAccess > 0 
            ? (this.stats.cacheHits / totalCacheAccess) * 100 
            : 0;
    }
    
    /**
     * 統計を取得
     */
    getStats() {
        return {
            ...this.stats,
            ...this.performanceMetrics,
            cacheSize: this.measurementCache.size,
            visibleElements: this.visibleElements.size,
            deferredElements: document.querySelectorAll('[data-deferred-update]').length,
            strategiesEnabled: Object.entries(this.strategies)
                .filter(([, enabled]) => enabled)
                .map(([strategy]) => strategy)
        };
    }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config) {
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
        }
        
        if (config.batchMode !== undefined) {
            this.batchMode = config.batchMode;
        }
        
        if (config.maxBatchSize !== undefined) {
            this.maxBatchSize = config.maxBatchSize;
        }
        
        if (config.strategies) {
            this.strategies = { ...this.strategies, ...config.strategies };
        }
        
        console.log('UIUpdateOptimizer configuration updated:', config);
    }
    
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.measurementCache.clear();
        this.layoutCache.clear();
        this.computedStyleCache.clear();
        
        console.log('UIUpdateOptimizer caches cleared');
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // タイマーをクリア
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        
        // オブザーバーを切断
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // キャッシュをクリア
        this.clearCache();
        
        console.log('UIUpdateOptimizer cleaned up');
    }
}