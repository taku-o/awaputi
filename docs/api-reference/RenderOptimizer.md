# RenderOptimizer

## 概要

ファイル: `utils/RenderOptimizer.js`  
最終更新: 2025/7/18 14:50:36

## 目次

## クラス
- [RenderOptimizer](#renderoptimizer)
- [PerformanceMonitor](#performancemonitor)
## 定数
- [canvas](#canvas)
- [layer](#layer)
- [objId](#objid)
- [margin](#margin)
- [size](#size)
- [newRegion](#newregion)
- [region](#region)
- [merged](#merged)
- [left](#left)
- [top](#top)
- [right](#right)
- [bottom](#bottom)
- [layer](#layer)
- [ctx](#ctx)
- [size](#size)
- [color](#color)
- [startTime](#starttime)
- [layer](#layer)
- [lastObj](#lastobj)
- [bounds](#bounds)
- [lastBounds](#lastbounds)
- [bounds](#bounds)
- [keys](#keys)
- [avgFrameTime](#avgframetime)
- [warnings](#warnings)

---

## RenderOptimizer

### コンストラクタ

```javascript
new RenderOptimizer(canvas)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `context` | 説明なし |
| `width` | 説明なし |
| `height` | 説明なし |
| `dirtyRegions` | 差分レンダリング用 |
| `lastFrameObjects` | 説明なし |
| `currentFrameObjects` | 説明なし |
| `layers` | レイヤーシステム |
| `layerOrder` | 説明なし |
| `viewport` | フラスタムカリング用 |
| `stats` | パフォーマンス測定 |
| `offscreenCanvas` | オフスクリーンキャンバス |
| `offscreenContext` | 説明なし |
| `layerOrder` | zIndexでソート |
| `stats` | 統計情報をリセット |
| `lastFrameObjects` | フレーム終了処理 |
| `dirtyRegions` | 説明なし |
| `viewport` | 説明なし |
| `dirtyRegions` | 多すぎる場合は全画面再描画 |
| `dirtyRegions` | 小さすぎる領域をマージ |
| `dirtyRegions` | 説明なし |

### メソッド

#### addLayer

**シグネチャ**:
```javascript
 addLayer(layerName, zIndex = 0)
```

**パラメーター**:
- `layerName`
- `zIndex = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addLayer(layerName, zIndex = 0);

// addLayerの実用的な使用例
const result = instance.addLayer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addObject

**シグネチャ**:
```javascript
 addObject(obj, layerName = 'default')
```

**パラメーター**:
- `obj`
- `layerName = 'default'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addObject(obj, layerName = 'default');

// addObjectの実用的な使用例
const result = instance.addObject(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isInViewport

**シグネチャ**:
```javascript
 isInViewport(obj)
```

**パラメーター**:
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isInViewport(obj);

// isInViewportの実用的な使用例
const result = instance.isInViewport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getObjectBounds

**シグネチャ**:
```javascript
 getObjectBounds(obj)
```

**パラメーター**:
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getObjectBounds(obj);

// getObjectBoundsの実用的な使用例
const result = instance.getObjectBounds(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addDirtyRegion

**シグネチャ**:
```javascript
 addDirtyRegion(x, y, width, height)
```

**パラメーター**:
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addDirtyRegion(x, y, width, height);

// addDirtyRegionの実用的な使用例
const result = instance.addDirtyRegion(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = this.dirtyRegions.length - 1; i >= 0; i--)
```

**パラメーター**:
- `let i = this.dirtyRegions.length - 1; i >= 0; i--`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = this.dirtyRegions.length - 1; i >= 0; i--);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### regionsOverlap

**シグネチャ**:
```javascript
 regionsOverlap(a, b)
```

**パラメーター**:
- `a`
- `b`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.regionsOverlap(a, b);

// regionsOverlapの実用的な使用例
const result = instance.regionsOverlap(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergeRegions

**シグネチャ**:
```javascript
 mergeRegions(a, b)
```

**パラメーター**:
- `a`
- `b`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergeRegions(a, b);

// mergeRegionsの実用的な使用例
const result = instance.mergeRegions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderLayer

**シグネチャ**:
```javascript
 renderLayer(layerName)
```

**パラメーター**:
- `layerName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderLayer(layerName);

// renderLayerの実用的な使用例
const result = instance.renderLayer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レイヤーをクリア（差分レンダリングの場合は部分的にクリア）

**シグネチャ**:
```javascript
 if (this.dirtyRegions.length > 0)
```

**パラメーター**:
- `this.dirtyRegions.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dirtyRegions.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderObject

**シグネチャ**:
```javascript
 renderObject(ctx, obj)
```

**パラメーター**:
- `ctx`
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderObject(ctx, obj);

// renderObjectの実用的な使用例
const result = instance.renderObject(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

共通の変換を適用

**シグネチャ**:
```javascript
 if (obj.x !== undefined && obj.y !== undefined)
```

**パラメーター**:
- `obj.x !== undefined && obj.y !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(obj.x !== undefined && obj.y !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (obj.rotation)
```

**パラメーター**:
- `obj.rotation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(obj.rotation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (obj.scale && obj.scale !== 1)
```

**パラメーター**:
- `obj.scale && obj.scale !== 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(obj.scale && obj.scale !== 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (obj.opacity !== undefined && obj.opacity !== 1)
```

**パラメーター**:
- `obj.opacity !== undefined && obj.opacity !== 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(obj.opacity !== undefined && obj.opacity !== 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

オブジェクト固有のレンダリング

**シグネチャ**:
```javascript
 if (obj.render && typeof obj.render === 'function')
```

**パラメーター**:
- `obj.render && typeof obj.render === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(obj.render && typeof obj.render === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderDefault

**シグネチャ**:
```javascript
 renderDefault(ctx, obj)
```

**パラメーター**:
- `ctx`
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderDefault(ctx, obj);

// renderDefaultの実用的な使用例
const result = instance.renderDefault(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render();

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

メインキャンバスをクリア（必要な部分のみ）

**シグネチャ**:
```javascript
 if (this.dirtyRegions.length > 0)
```

**パラメーター**:
- `this.dirtyRegions.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dirtyRegions.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dirtyRegions.length > 0)
```

**パラメーター**:
- `this.dirtyRegions.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dirtyRegions.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### detectChanges

**シグネチャ**:
```javascript
 detectChanges()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectChanges();

// detectChangesの実用的な使用例
const result = instance.detectChanges(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### objectChanged

**シグネチャ**:
```javascript
 objectChanged(lastObj, currentObj)
```

**パラメーター**:
- `lastObj`
- `currentObj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.objectChanged(lastObj, currentObj);

// objectChangedの実用的な使用例
const result = instance.objectChanged(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setViewport

**シグネチャ**:
```javascript
 setViewport(x, y, width, height)
```

**パラメーター**:
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setViewport(x, y, width, height);

// setViewportの実用的な使用例
const result = instance.setViewport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimize

**シグネチャ**:
```javascript
 optimize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimize();

// optimizeの実用的な使用例
const result = instance.optimize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダーティ領域を統合

**シグネチャ**:
```javascript
 if (this.dirtyRegions.length > 10)
```

**パラメーター**:
- `this.dirtyRegions.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dirtyRegions.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanup

**シグネチャ**:
```javascript
 cleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanup();

// cleanupの実用的な使用例
const result = instance.cleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## PerformanceMonitor

### コンストラクタ

```javascript
new PerformanceMonitor()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `frameCount` | 説明なし |
| `fps` | 説明なし |
| `lastTime` | 説明なし |
| `deltaTime` | 説明なし |
| `frameTimeHistory` | 説明なし |
| `maxHistorySize` | 説明なし |
| `memoryUsage` | 説明なし |
| `deltaTime` | 説明なし |
| `lastTime` | 説明なし |
| `fps` | 説明なし |
| `memoryUsage` | 説明なし |

### メソッド

#### startFrame

**シグネチャ**:
```javascript
 startFrame(currentTime)
```

**パラメーター**:
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startFrame(currentTime);

// startFrameの実用的な使用例
const result = instance.startFrame(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.frameTimeHistory.length > this.maxHistorySize)
```

**パラメーター**:
- `this.frameTimeHistory.length > this.maxHistorySize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameTimeHistory.length > this.maxHistorySize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

FPS計算（1秒ごと）

**シグネチャ**:
```javascript
 if (this.frameCount % 60 === 0)
```

**パラメーター**:
- `this.frameCount % 60 === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frameCount % 60 === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ使用量取得（利用可能な場合）

**シグネチャ**:
```javascript
 if (performance.memory)
```

**パラメーター**:
- `performance.memory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(performance.memory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getWarnings

**シグネチャ**:
```javascript
 getWarnings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getWarnings();

// getWarningsの実用的な使用例
const result = instance.getWarnings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.fps < 30)
```

**パラメーター**:
- `this.fps < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.fps < 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.deltaTime > 50)
```

**パラメーター**:
- `this.deltaTime > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.deltaTime > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.memoryUsage.usedJSHeapSize > this.memoryUsage.jsHeapSizeLimit * 0.8)
```

**パラメーター**:
- `this.memoryUsage.usedJSHeapSize > this.memoryUsage.jsHeapSizeLimit * 0.8`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.memoryUsage.usedJSHeapSize > this.memoryUsage.jsHeapSizeLimit * 0.8);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `canvas` | 説明なし |
| `layer` | 説明なし |
| `objId` | 説明なし |
| `margin` | 説明なし |
| `size` | 説明なし |
| `newRegion` | 説明なし |
| `region` | 説明なし |
| `merged` | 説明なし |
| `left` | 説明なし |
| `top` | 説明なし |
| `right` | 説明なし |
| `bottom` | 説明なし |
| `layer` | 説明なし |
| `ctx` | 説明なし |
| `size` | 説明なし |
| `color` | 説明なし |
| `startTime` | 説明なし |
| `layer` | 説明なし |
| `lastObj` | 説明なし |
| `bounds` | 説明なし |
| `lastBounds` | 説明なし |
| `bounds` | 説明なし |
| `keys` | 説明なし |
| `avgFrameTime` | 説明なし |
| `warnings` | 説明なし |

---

