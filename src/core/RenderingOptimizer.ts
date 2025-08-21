/**
 * レンダリング最適化クラス
 * Canvas描画の最適化、オフスクリーンキャンバス、差分更新、ビューポートカリングを提供する
 */
export class RenderingOptimizer {
    constructor() {
        // レンダリング設定
        this.config = {
            offscreenCanvas: {
                enabled: true;
    cacheSize: 10, // 最大10個のオフスクリーンキャンバスをキャッシュ
    }
                reusable: true;
            differentialUpdate: { enabled: true;
                trackDirtyRegions: true;
    mergeThreshold: 0.3, // 30%以上重複していればマージ;
                maxRegions: 20 // 最大20の差分領域を追跡  };
            viewportCulling: { enabled: true;
    margin: 50, // ビューポート外でも50pxマージンは描画;
                enableOcclusion: true // オクルージョンカリング  };
            performance: { targetFrameTime: 16, // 60fps = 16.67ms
                warningThreshold: 20, // 20ms超過で警告;
                emergencyThreshold: 33, // 33ms超過で緊急最適化;
                frameSkipping: true // 重い処理時のフレームスキップ  };
            layering: { enabled: true;
                maxLayers: 5;
    autoOptimize: true // レイヤーの自動最適化 
    };
        // オフスクリーンキャンバスプール
        this.offscreenCanvasPool = new Map();
        this.canvasCache = new Map();
        
        // 差分更新管理
        this.dirtyRegions = new Set();
        this.lastRenderState = new Map();
        
        // ビューポート管理
        this.viewport = { x: 0, y: 0, width: 1920, height: 1080;
            scaleFactor: 1, rotation: 0  };
        
        // パフォーマンス監視
        this.performanceMetrics = { frameCount: 0;
            averageFrameTime: 0;
            maxFrameTime: 0;
            skippedFrames: 0;
            dirtyRegionCount: 0;
            culledObjects: 0;
    lastFrameTime: 0  };
        // レイヤー管理
        this.layers = new Map();
        this.layerOrder = [];
        
        // レンダリング状態
        this.renderingState = { isRendering: false;
            lastRenderTime: 0;
            frameRequestId: null;
    emergencyMode: false;
        // オクルージョンカリング
        this.occlusionMap = new Map();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.setupOffscreenCanvasSupport();
        this.setupPerformanceMonitoring() }
        this.setupLayers(); }
    }
    
    /**
     * オフスクリーンキャンバスサポートの設定
     */
    setupOffscreenCanvasSupport() {
        if (!this.config.offscreenCanvas.enabled) return,
        
        // OffscreenCanvasの対応確認
        this.offscreenCanvasSupported = typeof OffscreenCanvas !== 'undefined';

        if (!this.offscreenCanvasSupported) {
    }

            console.warn('OffscreenCanvas not supported, falling back to regular canvas'); }'
}
    
    /**
     * パフォーマンス監視の設定
     */
    setupPerformanceMonitoring() {
        // フレーム時間の監視
        this.frameTimeHistory = [] }
        this.performanceAlert = null; }
    }
    
    /**
     * レイヤーシステムの設定
     */
    setupLayers() {

        if(!this.config.layering.enabled) return,
        ','
        // デフォルトレイヤーの作成
        const defaultLayers = ['background', 'charts', 'ui', 'overlay', 'debug'] }
        defaultLayers.forEach((layerName, index) => {  }
            this.createLayer(layerName, index); }
        };
    }
    
    /**
     * レイヤーの作成
     */
    createLayer(name, zIndex = 0) {
        const layer = {
            name,
            zIndex,
            canvas: null,
            context: null,
            isDirty: false,
            visible: true,
            opacity: 1.0,
    renderables: [] }
            lastUpdate: 0 
    };
        this.layers.set(name, layer);
        this.updateLayerOrder();
        
        return layer;
    }
    
    /**
     * レイヤー順序の更新
     */
    updateLayerOrder() {
        this.layerOrder = Array.from(this.layers.values();
            .sort((a, b) => a.zIndex - b.zIndex) }
            .map(layer => layer.name); }
    }
    
    /**
     * 最適化されたレンダリング
     */
    async renderOptimized(context, renderables, options = { ) {
        const frameStartTime = performance.now();
        try {
            this.renderingState.isRendering = true,
            
            // ビューポートの更新
            this.updateViewport(context, options);
            // 緊急モードチェック
            if (this.shouldEnterEmergencyMode() {
    
}
                return await this.renderEmergencyMode(context, renderables, options);
            
            // レンダリング方式の決定
            if (this.config.differentialUpdate.enabled && this.hasDirtyRegions() { return await this.renderDifferential(context, renderables, options) } else if (this.config.layering.enabled) { return await this.renderLayered(context, renderables, options) } else { return await this.renderDirect(context, renderables, options),' }'

            } catch (error) {
            console.error('Optimized rendering failed:', error);
            throw error } finally { this.renderingState.isRendering = false,
            this.updatePerformanceMetrics(frameStartTime) }
    }
    
    /**
     * ビューポートの更新
     */
    updateViewport(context, options) {
        const canvas = context.canvas,
        
        this.viewport = {
            x: options.viewportX || 0,
            y: options.viewportY || 0,
            width: canvas.width,
            height: canvas.height,
    scaleFactor: options.scaleFactor || 1 }
            rotation: options.rotation || 0 
    }
    
    /**
     * 緊急モード判定
     */
    shouldEnterEmergencyMode() {
        const recentFrameTimes = this.frameTimeHistory.slice(-5);
        const averageRecentTime = recentFrameTimes.reduce((sum, time) => sum + time, 0) / recentFrameTimes.length }
        return averageRecentTime > this.config.performance.emergencyThreshold;
    
    /**
     * 緊急モードレンダリング
     */
    async renderEmergencyMode(context, renderables, options) { this.renderingState.emergencyMode = true,
        
        // 最小限の描画のみ実行
        const essentialRenderables = this.filterEssentialRenderables(renderables);
        const culledRenderables = this.applyViewportCulling(essentialRenderables);
        // 品質を下げて描画
        const emergencyOptions = {
            ...options,
            quality: 'low',
            skipAnimations: true,
    skipEffects: true,
        return await this.renderDirect(context, culledRenderables, emergencyOptions);
    }
    
    /**
     * 必須レンダラブルのフィルタリング'
     */''
    filterEssentialRenderables(renderables) { return renderables.filter(renderable => { ') }'

            return renderable.essential || renderable.priority === 'high');
    
    /**
     * 差分更新レンダリング
     */
    async renderDifferential(context, renderables, options) { const dirtyRegions = Array.from(this.dirtyRegions);
        // 差分領域のマージ
        const mergedRegions = this.mergeDirtyRegions(dirtyRegions);
        // 各差分領域を描画
        for (const region of mergedRegions) {
    
}
            await this.renderRegion(context, renderables, region, options); }
        }
        ;
        // 差分領域をクリア
        this.dirtyRegions.clear()';'
            type: 'differential',
    regionsUpdated: mergedRegions.length),
            totalArea: mergedRegions.reduce((sum, region) => sum + (region.width * region.height), 0);
        }
    
    /**
     * 差分領域のマージ
     */
    mergeDirtyRegions(regions) {
        if (regions.length <= 1) return regions,
        
        const merged = [],
        const processed = new Set();
        for (let, i = 0, i < regions.length, i++) {
            if(processed.has(i) continue }
            let currentRegion = { ...regions[i],
            processed.add(i);
            // 他の領域との重複チェック
            for(let, j = i + 1, j < regions.length, j++) {
                if(processed.has(j) continue,
                
                const overlap = this.calculateOverlap(currentRegion, regions[j]);
                const mergedArea = this.calculateMergedArea(currentRegion, regions[j]);
                const totalArea = (currentRegion.width * currentRegion.height) + (regions[j].width * regions[j].height),
                
                // マージ判定
                if (overlap / totalArea > this.config.differentialUpdate.mergeThreshold) {
                    currentRegion = this.mergeRegions(currentRegion, regions[j]) }
                    processed.add(j); }
}
            
            merged.push(currentRegion);
        }
        
        return merged;
    }
    
    /**
     * 領域の重複計算
     */
    calculateOverlap(region1, region2) {
        const x1 = Math.max(region1.x, region2.x);
        const y1 = Math.max(region1.y, region2.y);
        const x2 = Math.min(region1.x + region1.width, region2.x + region2.width);
        const y2 = Math.min(region1.y + region1.height, region2.y + region2.height);
        if (x2 <= x1 || y2 <= y1) return 0 }
        return (x2 - x1) * (y2 - y1);
    
    /**
     * マージ後の面積計算
     */
    calculateMergedArea(region1, region2) {
        const x1 = Math.min(region1.x, region2.x);
        const y1 = Math.min(region1.y, region2.y);
        const x2 = Math.max(region1.x + region1.width, region2.x + region2.width);
        const y2 = Math.max(region1.y + region1.height, region2.y + region2.height) }
        return (x2 - x1) * (y2 - y1);
    
    /**
     * 領域のマージ
     */
    mergeRegions(region1, region2) {
        const x = Math.min(region1.x, region2.x);
        const y = Math.min(region1.y, region2.y);
        const width = Math.max(region1.x + region1.width, region2.x + region2.width) - x,
        const height = Math.max(region1.y + region1.height, region2.y + region2.height) - y }
        return { x, y, width, height }
    
    /**
     * 領域レンダリング
     */
    async renderRegion(context, renderables, region, options) { // クリッピング設定
        context.save();
        context.beginPath();
        context.rect(region.x, region.y, region.width, region.height);
        context.clip();
        try {
            // 領域内のレンダラブルをフィルタリング
            const regionRenderables = this.filterRenderablesInRegion(renderables, region);
            // ビューポートカリング適用
            const culledRenderables = this.applyViewportCulling(regionRenderables);
            // レンダラブルを描画
            for (const renderable of culledRenderables) {
    
}
                await this.renderSingle(context, renderable, options); }
} finally { context.restore() }
    }
    
    /**
     * 領域内レンダラブルのフィルタリング
     */
    filterRenderablesInRegion(renderables, region) {
        return renderables.filter(renderable => { );
            if (!renderable.bounds) return true,
            return this.intersectsRegion(renderable.bounds, region)) }
    
    /**
     * 領域交差判定
     */
    intersectsRegion(bounds, region) {
        return !(bounds.x + bounds.width < region.x ||,
                bounds.x > region.x + region.width ||,
                bounds.y + bounds.height < region.y || }
                bounds.y > region.y + region.height); }
    }
    
    /**
     * レイヤードレンダリング
     */
    async renderLayered(context, renderables, options) { // レンダラブルをレイヤーに分散
        this.distributeRenderablesToLayers(renderables);
        // 各レイヤーを順序通りに描画
        for (const layerName of this.layerOrder) {
            const layer = this.layers.get(layerName);
            if (!layer || !layer.visible || layer.renderables.length === 0) continue,
            ' }'

            await this.renderLayer(context, layer, options); }
        }
        ';'

        return { ''
            type: 'layered',
    layersRendered: this.layerOrder.length },
            totalRenderables: renderables.length 
    }
    
    /**
     * レンダラブルのレイヤー分散
     */
    distributeRenderablesToLayers(renderables) {
        // 各レイヤーをクリア
        for (const layer of this.layers.values() {
    }
            layer.renderables = []; }
        }
        
        // レンダラブルを適切なレイヤーに配置
        for (const renderable of renderables) {
            const layerName = this.determineLayer(renderable);
            const layer = this.layers.get(layerName);
            if (layer) {
                layer.renderables.push(renderable) }
                layer.isDirty = true; }
}
    }
    
    /**
     * レンダラブルのレイヤー判定
     */
    determineLayer(renderable) {
        if (renderable.layer) return renderable.layer,
        // タイプに基づく自動判定
        switch(renderable.type) {''
            case 'background': return 'background',
            case 'chart':','
            case 'graph': return 'charts',
            case 'button':','
            case 'text':','
            case 'label': return 'ui',
            case 'popup':','
            case 'modal':','
            case 'tooltip': return 'overlay',
            case 'debug': return 'debug' }

            default: return 'charts',
    
    /**
     * レイヤーレンダリング
     */
    async renderLayer(context, layer, options) { if (!layer.isDirty && layer.canvas) {
            // キャッシュされたレイヤーを使用
            context.globalAlpha = layer.opacity,
            context.drawImage(layer.canvas, 0, 0);
            context.globalAlpha = 1.0,
            return }
        
        // レイヤーキャンバスの作成または取得
        if (!layer.canvas) {

            layer.canvas = this.createLayerCanvas(this.viewport.width, this.viewport.height) }

            layer.context = layer.canvas.getContext('2d'; }'
        }
        
        // レイヤーをクリア
        layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        
        // ビューポートカリング適用
        const culledRenderables = this.applyViewportCulling(layer.renderables);
        
        // レイヤーにレンダラブルを描画
        for (const renderable of culledRenderables) { await this.renderSingle(layer.context, renderable, options) }
        
        // メインキャンバスに合成
        context.globalAlpha = layer.opacity;
        context.drawImage(layer.canvas, 0, 0);
        context.globalAlpha = 1.0;
        
        layer.isDirty = false;
        layer.lastUpdate = Date.now();
    }
    
    /**
     * レイヤーキャンバスの作成
     */
    createLayerCanvas(width, height) {
        if (this.offscreenCanvasSupported && this.config.offscreenCanvas.enabled) {
    }

            return new OffscreenCanvas(width, height); else {  ''
            const canvas = document.createElement('canvas),'
            canvas.width = width,
            canvas.height = height }
            return canvas;
    
    /**
     * ダイレクトレンダリング
     */
    async renderDirect(context, renderables, options) { // ビューポートカリング適用
        const culledRenderables = this.applyViewportCulling(renderables);
        // 各レンダラブルを直接描画
        for (const renderable of culledRenderables) { }

            await this.renderSingle(context, renderable, options); }
        }
        ';'

        return { ''
            type: 'direct',
    renderablesProcessed: culledRenderables.length },
            culledCount: renderables.length - culledRenderables.length 
    }
    
    /**
     * ビューポートカリングの適用
     */
    applyViewportCulling(renderables) {
        if (!this.config.viewportCulling.enabled) return renderables,
        
        const margin = this.config.viewportCulling.margin,
        const extendedViewport = {
            x: this.viewport.x - margin,
            y: this.viewport.y - margin,
    width: this.viewport.width + (margin * 2) }
            height: this.viewport.height + (margin * 2); 
    };
        
        const visible = renderables.filter(renderable => {  );
            if (!renderable.bounds) return true, // 境界不明の場合は描画
             }
            return this.isInViewport(renderable.bounds, extendedViewport););
        
        this.performanceMetrics.culledObjects = renderables.length - visible.length;
        
        return visible;
    }
    
    /**
     * ビューポート内判定
     */
    isInViewport(bounds, viewport) {
        return !(bounds.x + bounds.width < viewport.x ||,
                bounds.x > viewport.x + viewport.width ||,
                bounds.y + bounds.height < viewport.y || }
                bounds.y > viewport.y + viewport.height); }
    }
    
    /**
     * 単一レンダラブルの描画
     */
    async renderSingle(context, renderable, options) { if (!renderable || !renderable.render) return,
        
        try {
            // オクルージョンカリング
            if (this.config.viewportCulling.enableOcclusion) {
                if (this.isOccluded(renderable) {
            }
                    return; }
}
            
            // レンダリング実行
            await renderable.render(context, options);
            
            // レンダリング状態の記録
            this.updateRenderState(renderable);

        } catch (error) { console.error('Single renderable rendering failed:', error }
    }
    
    /**
     * オクルージョン判定
     */
    isOccluded(renderable) {
        if (!renderable.bounds) return false,
        
        // 簡単なオクルージョンカリング（前面のオブジェクトに完全に隠されているかチェック）
        for (const [id, occluder] of this.occlusionMap) {
            if (id === renderable.id) continue,
            
            if (this.isCompletelyOccluded(renderable.bounds, occluder.bounds) {
    }
                return true;
        
        return false;
    }
    
    /**
     * 完全オクルージョン判定
     */
    isCompletelyOccluded(bounds, occluderBounds) {
        return bounds.x >= occluderBounds.x &&,
               bounds.y >= occluderBounds.y &&,
               bounds.x + bounds.width <= occluderBounds.x + occluderBounds.width && }
               bounds.y + bounds.height <= occluderBounds.y + occluderBounds.height; }
    }
    
    /**
     * レンダリング状態の更新
     */
    updateRenderState(renderable) {
        if (renderable.id) {
            this.lastRenderState.set(renderable.id, {
                bounds: renderable.bounds,
    lastRender: Date.now() }
                version: renderable.version || 1 
    };
        }
    }
    
    /**
     * 差分領域の追加
     */
    addDirtyRegion(region) { if (!this.config.differentialUpdate.enabled) return,
        
        this.dirtyRegions.add(region);
        // 最大領域数制限
        if (this.dirtyRegions.size > this.config.differentialUpdate.maxRegions) {
            // 全画面更新に切り替え
            this.dirtyRegions.clear();
            this.addDirtyRegion({)
                x: 0, y: 0,
    width: this.viewport.width }
                height: this.viewport.height); 
    }
    
    /**
     * 差分領域の存在確認
     */
    hasDirtyRegions() { return this.dirtyRegions.size > 0 }
    
    /**
     * オフスクリーンキャンバスの取得
     */
    getOffscreenCanvas(width, height, id = null) {
        if (!this.config.offscreenCanvas.enabled) return null }
        const key = id || `${width}x${height}`;
        
        // キャッシュから取得
        if (this.canvasCache.has(key) { return this.canvasCache.get(key) }
        
        // 新規作成
        const canvas = this.createLayerCanvas(width, height);
        
        // キャッシュサイズ制限
        if (this.canvasCache.size >= this.config.offscreenCanvas.cacheSize) {
            const firstKey = this.canvasCache.keys().next().value }
            this.canvasCache.delete(firstKey); }
        }
        
        this.canvasCache.set(key, canvas);
        return canvas;
    }
    
    /**
     * パフォーマンスメトリクスの更新
     */
    updatePerformanceMetrics(startTime) {
        const frameTime = performance.now() - startTime,
        
        this.performanceMetrics.frameCount++,
        this.performanceMetrics.lastFrameTime = frameTime,
        this.performanceMetrics.maxFrameTime = Math.max(this.performanceMetrics.maxFrameTime, frameTime);
        // 移動平均の計算
        const count = this.performanceMetrics.frameCount,
        this.performanceMetrics.averageFrameTime = ,
            (this.performanceMetrics.averageFrameTime * (count - 1) + frameTime) / count,
        
        // フレーム時間履歴の更新
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > 100) {
    }
            this.frameTimeHistory = this.frameTimeHistory.slice(-100); }
        }
        
        // パフォーマンス警告
        if (frameTime > this.config.performance.warningThreshold) { this.triggerPerformanceWarning(frameTime) }
        
        // 緊急モードの解除
        if (this.renderingState.emergencyMode && frameTime < this.config.performance.targetFrameTime) { this.renderingState.emergencyMode = false }
    }
    
    /**
     * パフォーマンス警告のトリガー
     */
    triggerPerformanceWarning(frameTime) {
        if (this.performanceAlert) return, // 重複警告防止
        ','

        this.performanceAlert = {''
            timestamp: Date.now('}'

            type: frameTime > this.config.performance.emergencyThreshold ? 'emergency' : 'warning' })
        );
        console.warn(`Rendering, performance ${this.performanceAlert.type}: ${frameTime.toFixed(2}ms`);
        
        // 警告の自動クリア
        setTimeout(() => { this.performanceAlert = null }, 5000);
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStatistics() {
        return { ...this.performanceMetrics,
            frameTimeHistory: [...this.frameTimeHistory],
            emergencyMode: this.renderingState.emergencyMode,
            dirtyRegionCount: this.dirtyRegions.size,
    layerCount: this.layers.size }
            canvasCacheSize: this.canvasCache.size },
            offscreenCanvasSupported: this.offscreenCanvasSupported 
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        // 設定変更に応じた再初期化
        if (newConfig.layering) {
    }
            this.setupLayers(); }
}
    
    /**
     * キャッシュのクリア
     */
    clearCache() {
        this.canvasCache.clear();
        this.offscreenCanvasPool.clear();
        this.dirtyRegions.clear();
        this.lastRenderState.clear();
        this.occlusionMap.clear();
        // レイヤーキャンバスのクリア
        for (const layer of this.layers.values() {
            layer.canvas = null,
            layer.context = null,
            layer.renderables = [] }
            layer.isDirty = true; }
}
    
    /**
     * リソースの破棄
     */
    destroy() {
        this.clearCache();
        if (this.renderingState.frameRequestId) {
    }
            cancelAnimationFrame(this.renderingState.frameRequestId); }
        }

        this.layers.clear();