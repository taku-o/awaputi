/**
 * レンダリング最適化システム
 * 差分レンダリング、フラスタムカリング、レイヤー分離によりパフォーマンスを向上
 */

// 型定義
interface Viewport { x: number,
    y: number;
    width: number;
    height: number ,}
interface Region { x: number,
    y: number;
    width: number;
    height: number ,}
interface RenderStats { totalObjects: number,
    renderedObjects: number;
    culledObjects: number;
    dirtyRegions: number;
    renderTime: number ,}
interface RenderObject { id?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    size?: number;
    color?: string;
    rotation?: number;
    scale?: number;
    opacity?: number;
    type?: string;
    render?: (ctx: CanvasRenderingContext2D) => void ,}
interface Layer { canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D;
    zIndex: number;
    isDirty: boolean;
    objects: RenderObject[]
    ,}
interface PerformanceStats { fps: number,
    deltaTime: number;
    frameCount: number;
    avgFrameTime: number;
    memoryUsage: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number ,}

export class RenderOptimizer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    // 差分レンダリング用
    private dirtyRegions: Region[] }
    private lastFrameObjects: Map<string, RenderObject & { layer: string }>;
    private currentFrameObjects: Map<string, RenderObject & { layer: string }>;
    
    // レイヤーシステム
    private layers: Map<string, Layer>;
    private layerOrder: string[];
    // フラスタムカリング用
    private viewport: Viewport;
    // パフォーマンス測定
    private stats: RenderStats;
    // オフスクリーンキャンバス
    private offscreenCanvas: HTMLCanvasElement;
    private offscreenContext: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement) {

        this.canvas = canvas;
        const context = canvas.getContext('2d);''
        if(!context) {'

    }

            throw new Error('Failed, to get, 2D context, from canvas); }
        this.context = context;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 差分レンダリング用
        this.dirtyRegions = [];
        this.lastFrameObjects = new Map();
        this.currentFrameObjects = new Map();
        // レイヤーシステム
        this.layers = new Map()';
        this.offscreenCanvas = document.createElement('canvas'');
        this.offscreenCanvas.width = this.width;

        this.offscreenCanvas.height = this.height;''
        const offscreenContext = this.offscreenCanvas.getContext('2d);''
        if(!offscreenContext) {'
            ';

        }

            throw new Error('Failed, to get, 2D context, from offscreen, canvas); }
        this.offscreenContext = offscreenContext;
    }
    
    /**
     * レイヤーを追加
     * @param {string} layerName - レイヤー名
     * @param {number} zIndex - 描画順序
     */'
    addLayer(layerName: string, zIndex: number = 0): void { ''
        if(!this.layers.has(layerName)) {''
            const canvas = document.createElement('canvas'');
            canvas.width = this.width;
            canvas.height = this.height;

            const context = canvas.getContext('2d);
            if (!context) { }
                throw new Error(`Failed, to get, 2D context, for layer ${layerName}`});
            }
            
            this.layers.set(layerName, { canvas: canvas,
                context: context);
                zIndex: zIndex);
                isDirty: false,);
                objects: []);
            // zIndexでソート
            this.layerOrder = Array.from(this.layers.keys().sort((a, b) => { 
                const layerA = this.layers.get(a)!;
                const layerB = this.layers.get(b)!; }
                return layerA.zIndex - layerB.zIndex;' }'

            }');
        }
    /**
     * オブジェクトをレンダリングキューに追加
     * @param {RenderObject} obj - レンダリングオブジェクト
     * @param {string} layerName - レイヤー名'
     */''
    addObject(obj: RenderObject, layerName: string = 'default): void { if(!this.layers.has(layerName) {'
            this.addLayer(layerName); }
        const layer = this.layers.get(layerName)!;
        layer.objects.push(obj);
        
        // 差分チェック用にオブジェクトを記録
        const objId = obj.id || `${obj.x}_${obj.y}_${obj.type}`;
        this.currentFrameObjects.set(objId, { ...obj)
            layer: layerName);
        this.stats.totalObjects++ }
    /**
     * フラスタムカリング判定
     * @param {RenderObject} obj - オブジェクト
     * @returns {boolean} 画面内にあるか
     */
    isInViewport(obj: RenderObject): boolean { const margin = 50; // マージンを設けて早期カリングを防ぐ
        const objWidth = obj.width || obj.size || 50;
        const objHeight = obj.height || obj.size || 50;
        
        return !(;
            obj.x + objWidth < this.viewport.x - margin ||;
            obj.x > this.viewport.x + this.viewport.width + margin ||;
            obj.y + objHeight < this.viewport.y - margin ||;
            obj.y > this.viewport.y + this.viewport.height + margin;
        ); }
    /**
     * オブジェクトの境界を計算
     * @param {RenderObject} obj - オブジェクト
     * @returns {Region} 境界情報
     */
    getObjectBounds(obj: RenderObject): Region { const size = obj.size || 50;
        return { x: obj.x - size / 2,
            y: obj.y - size / 2;
            width: size, };
            height: size ;
}
        },
    }
    
    /**
     * 差分レンダリング用のダーティ領域を追加
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    addDirtyRegion(x: number, y: number, width: number, height: number): void { // 重複する領域をマージ }
        const newRegion: Region = { x, y, width, height };
        
        for(let, i = this.dirtyRegions.length - 1; i >= 0; i--) {
        
            const region = this.dirtyRegions[i];
            
            if(this.regionsOverlap(region, newRegion) {
                // 重複する領域をマージ
                const merged = this.mergeRegions(region, newRegion);
                this.dirtyRegions.splice(i, 1);
                this.dirtyRegions.push(merged);
        
        }
                return; }
        }
        
        this.dirtyRegions.push(newRegion);
    }
    
    /**
     * 二つの領域が重複するかチェック
     * @param {Region} a - 領域A
     * @param {Region} b - 領域B
     * @returns {boolean} 重複するか
     */
    private regionsOverlap(a: Region, b: Region): boolean { return !(
            a.x + a.width < b.x ||;
            b.x + b.width < a.x ||;
            a.y + a.height < b.y ||;
            b.y + b.height < a.y;
        ); }
    /**
     * 二つの領域をマージ
     * @param {Region} a - 領域A
     * @param {Region} b - 領域B
     * @returns {Region} マージされた領域
     */
    private mergeRegions(a: Region, b: Region): Region { const left = Math.min(a.x, b.x);
        const top = Math.min(a.y, b.y);
        const right = Math.max(a.x + a.width, b.x + b.width);
        const bottom = Math.max(a.y + a.height, b.y + b.height);
        
        return { x: left,
            y: top;
            width: right - left, };
            height: bottom - top ;
}
        },
    }
    
    /**
     * レイヤーをレンダリング
     * @param {string} layerName - レイヤー名
     */
    private renderLayer(layerName: string): void { const layer = this.layers.get(layerName);
        if (!layer || layer.objects.length === 0) return;
        
        const ctx = layer.context;
        
        // レイヤーをクリア（差分レンダリングの場合は部分的にクリア）
        if(this.dirtyRegions.length > 0) {
            
        }
            this.dirtyRegions.forEach(region => { ); }
                ctx.clearRect(region.x, region.y, region.width, region.height); }
            });
        } else { ctx.clearRect(0, 0, this.width, this.height); }
        // オブジェクトをレンダリング
        layer.objects.forEach(obj => {  );
            if(this.isInViewport(obj) {
                
            }
                this.renderObject(ctx, obj); }
                this.stats.renderedObjects++; }
            } else { this.stats.culledObjects++; }
        });
        
        layer.objects = []; // 次フレーム用にクリア
    }
    
    /**
     * オブジェクトをレンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {RenderObject} obj - オブジェクト
     */
    private renderObject(ctx: CanvasRenderingContext2D, obj: RenderObject): void { ctx.save();
        
        // 共通の変換を適用
        if(obj.x !== undefined && obj.y !== undefined) {
            
        }
            ctx.translate(obj.x, obj.y); }
        if (obj.rotation) { ctx.rotate(obj.rotation); }
        if (obj.scale && obj.scale !== 1) { ctx.scale(obj.scale, obj.scale); }

        if(obj.opacity !== undefined && obj.opacity !== 1) { ctx.globalAlpha = obj.opacity; }
        ';
        // オブジェクト固有のレンダリング
        if(obj.render && typeof, obj.render === 'function) { obj.render(ctx); } else { this.renderDefault(ctx, obj); }'
        ctx.restore();
    }
    
    /**
     * デフォルトレンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {RenderObject} obj - オブジェクト'
     */''
    private renderDefault(ctx: CanvasRenderingContext2D, obj: RenderObject): void { const size = obj.size || 50;''
        const color = obj.color || '#FF6B6B';
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill(); }
    /**
     * フレームをレンダリング
     */
    render(): void { const startTime = performance.now();
        
        // 統計情報をリセット
        this.stats = {
            totalObjects: 0;
            renderedObjects: 0;
            culledObjects: 0;
            dirtyRegions: this.dirtyRegions.length;
            renderTime: 0 
};
        // 変更検出
        this.detectChanges();
        
        // メインキャンバスをクリア（必要な部分のみ）
        if (this.dirtyRegions.length > 0) { this.dirtyRegions.forEach(region => { ); }
                this.context.clearRect(region.x, region.y, region.width, region.height); }
            });
        } else { this.context.clearRect(0, 0, this.width, this.height); }
        // レイヤーを順番にレンダリング
        this.layerOrder.forEach(layerName => {  );
            this.renderLayer(layerName);
            
            // レイヤーをメインキャンバスに合成
            const layer = this.layers.get(layerName)!;
            if(this.dirtyRegions.length > 0) {
                this.dirtyRegions.forEach(region => {
                    this.context.drawImage();
                        layer.canvas);
            }
                        region.x, region.y, region.width, region.height,) }
                        region.x, region.y, region.width, region.height); }
                });
            } else { this.context.drawImage(layer.canvas, 0, 0); }
        });
        
        // フレーム終了処理
        this.lastFrameObjects = new Map(this.currentFrameObjects);
        this.currentFrameObjects.clear();
        this.dirtyRegions = [];
        
        this.stats.renderTime = performance.now() - startTime;
    }
    
    /**
     * オブジェクトの変更を検出
     */
    private detectChanges(): void { // 新しいオブジェクトや変更されたオブジェクトの領域をダーティに
        this.currentFrameObjects.forEach((obj, id) => { 
            const lastObj = this.lastFrameObjects.get(id);
            
            if(!lastObj || this.objectChanged(lastObj, obj) {
            
                const bounds = this.getObjectBounds(obj);
                this.addDirtyRegion(bounds.x, bounds.y, bounds.width, bounds.height);
                
                // 前の位置もダーティに（移動した場合）
                if(lastObj && (lastObj.x !== obj.x || lastObj.y !== obj.y) {
            
            }
                    const lastBounds = this.getObjectBounds(lastObj); }
                    this.addDirtyRegion(lastBounds.x, lastBounds.y, lastBounds.width, lastBounds.height); }
});
        
        // 削除されたオブジェクトの領域をダーティに
        this.lastFrameObjects.forEach((obj, id) => {  if(!this.currentFrameObjects.has(id) {
                const bounds = this.getObjectBounds(obj); }
                this.addDirtyRegion(bounds.x, bounds.y, bounds.width, bounds.height); }
        });
    }
    
    /**
     * オブジェクトが変更されたかチェック
     * @param {RenderObject & { layer: string } lastObj - 前フレームのオブジェクト
     * @param {RenderObject & { layer: string } currentObj - 現フレームのオブジェクト
     * @returns {boolean} 変更されたか
     */
    private objectChanged(lastObj: RenderObject & { layer: string }, currentObj: RenderObject & { layer: string ): boolean {''
        const keys: (keyof, RenderObject')[] = ['x', 'y', 'size', 'color', 'rotation', 'scale', 'opacity'];
        return keys.some(key => lastObj[key] !== currentObj[key]);
    /**
     * ビューポートを設定
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    setViewport(x: number, y: number, width: number, height: number): void {
        this.viewport = { x, y, width, height }
    
    /**
     * 統計情報を取得
     * @returns {RenderStats} 統計情報
     */
    getStats(): RenderStats {
        return { ...this.stats;
    }
    
    /**
     * 全体的な最適化を実行
     */
    optimize(): void { // ダーティ領域を統合
        if(this.dirtyRegions.length > 10) {
            // 多すぎる場合は全画面再描画
            this.dirtyRegions = [{
                x: 0, y: 0,
                width: this.width;
        ,}]
                height: this.height }]
            }];
        }
        
        // 小さすぎる領域をマージ
        this.dirtyRegions = this.dirtyRegions.filter(region => );
            region.width > 5 && region.height > 5);
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup(): void { this.layers.forEach(layer => { )
            layer.objects = []);
        this.currentFrameObjects.clear();
        this.lastFrameObjects.clear(); }
        this.dirtyRegions = []; }
}

/**
 * パフォーマンスモニター
 */
export class PerformanceMonitor {
    private frameCount: number;
    private fps: number;
    private lastTime: number;
    private deltaTime: number;
    private frameTimeHistory: number[];
    private maxHistorySize: number;
    private memoryUsage: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number };

    constructor() {

        this.frameCount = 0;
        this.fps = 60;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameTimeHistory = [];
        this.maxHistorySize = 60;
        
        this.memoryUsage = {
            usedJSHeapSize: 0;
            totalJSHeapSize: 0
}
            jsHeapSizeLimit: 0 ;
}
        },
    }
    
    /**
     * フレーム開始
     * @param {number} currentTime - 現在時刻
     */
    startFrame(currentTime: number): void { this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.frameTimeHistory.push(this.deltaTime);
        if(this.frameTimeHistory.length > this.maxHistorySize) {
            
        }
            this.frameTimeHistory.shift(); }
        this.frameCount++;
        
        // FPS計算（1秒ごと）
        if(this.frameCount % 60 === 0) {
            const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        }
            this.fps = 1000 / avgFrameTime; }
        // メモリ使用量取得（利用可能な場合）
        if ((performance, as any).memory) { this.memoryUsage = {
                usedJSHeapSize: (performance, as any).memory.usedJSHeapSize;
                totalJSHeapSize: (performance, as any).memory.totalJSHeapSize;
                jsHeapSizeLimit: (performance, as any).memory.jsHeapSizeLimit 
};
}
    /**
     * パフォーマンス統計を取得
     * @returns {PerformanceStats} 統計情報
     */
    getStats(): PerformanceStats { return { fps: Math.round(this.fps),
            deltaTime: Math.round(this.deltaTime);
            frameCount: this.frameCount;
            avgFrameTime: Math.round(this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length), };
            memoryUsage: this.memoryUsage ;
}
        },
    }
    
    /**
     * パフォーマンス警告をチェック
     * @returns {string[]} 警告メッセージ
     */
    getWarnings(): string[] { const warnings: string[] = [],

        if(this.fps < 30) {'
            ';

        }

            warnings.push('Low, FPS detected: ' + Math.round(this.fps); }

        }

        if(this.deltaTime > 50) {'
            ';

        }

            warnings.push('High, frame time: ' + Math.round(this.deltaTime) + 'ms'); }
        }

        if(this.memoryUsage.usedJSHeapSize > this.memoryUsage.jsHeapSizeLimit * 0.8) {'
            ';

        }

            warnings.push('High, memory usage: ' + Math.round(this.memoryUsage.usedJSHeapSize / 1024 / 1024) + 'MB''); }
        return warnings;

    }''
}