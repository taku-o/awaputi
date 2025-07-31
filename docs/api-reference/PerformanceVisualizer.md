# PerformanceVisualizer

## 概要

ファイル: `debug/PerformanceVisualizer.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [PerformanceVisualizer](#performancevisualizer)
- [PerformanceChart](#performancechart)
- [PerformanceHeatmap](#performanceheatmap)
## 定数
- [rect](#rect)
- [x](#x)
- [y](#y)
- [rect](#rect)
- [x](#x)
- [y](#y)
- [render](#render)
- [now](#now)
- [metrics](#metrics)
- [historyData](#historydata)
- [fpsChart](#fpschart)
- [memoryChart](#memorychart)
- [frameTimeChart](#frametimechart)
- [drawCallsChart](#drawcallschart)
- [entitiesChart](#entitieschart)
- [heatmap](#heatmap)
- [cutoffTime](#cutofftime)
- [ctx](#ctx)
- [canvas](#canvas)
- [stats](#stats)
- [y](#y)
- [statsText](#statstext)
- [hover](#hover)
- [boxWidth](#boxwidth)
- [boxHeight](#boxheight)
- [x](#x)
- [y](#y)
- [lines](#lines)
- [analysis](#analysis)
- [alertY](#alerty)
- [criticalAnomalies](#criticalanomalies)
- [warningAnomalies](#warninganomalies)
- [dataPoint](#datapoint)
- [zoomFactor](#zoomfactor)
- [isVisible](#isvisible)
- [dataURL](#dataurl)
- [link](#link)
- [pos](#pos)
- [currentValue](#currentvalue)
- [valueText](#valuetext)
- [pos](#pos)
- [gridLines](#gridlines)
- [y](#y)
- [x](#x)
- [pos](#pos)
- [lastDataPoint](#lastdatapoint)
- [drawThresholdLine](#drawthresholdline)
- [y](#y)
- [pos](#pos)
- [valueRange](#valuerange)
- [now](#now)
- [timeWindow](#timewindow)
- [dataPoint](#datapoint)
- [age](#age)
- [x](#x)
- [y](#y)
- [pos](#pos)
- [pos](#pos)
- [relativeX](#relativex)
- [timeWindow](#timewindow)
- [now](#now)
- [targetTime](#targettime)
- [distance](#distance)
- [normalizedScore](#normalizedscore)
- [cutoffTime](#cutofftime)
- [pos](#pos)
- [pos](#pos)
- [cellSize](#cellsize)
- [cols](#cols)
- [rows](#rows)
- [now](#now)
- [timeWindow](#timewindow)
- [cellTime](#celltime)
- [cellY](#celly)
- [score](#score)
- [color](#color)
- [x](#x)
- [y](#y)
- [timeTolerances](#timetolerances)
- [relevantData](#relevantdata)
- [closest](#closest)
- [current](#current)
- [next](#next)
- [ratio](#ratio)
- [pos](#pos)
- [scaleWidth](#scalewidth)
- [scaleHeight](#scaleheight)
- [scaleX](#scalex)
- [scaleY](#scaley)
- [value](#value)
- [color](#color)

---

## PerformanceVisualizer

### コンストラクタ

```javascript
new PerformanceVisualizer(monitor)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `monitor` | 説明なし |
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `charts` | 説明なし |
| `animationId` | 説明なし |
| `settings` | 可視化設定 |
| `chartState` | チャート状態 |
| `canvas` | 説明なし |
| `ctx` | Initially hidden |
| `animationId` | 説明なし |
| `animationId` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
 initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### createCanvas

**シグネチャ**:
```javascript
 createCanvas()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createCanvas();

// createCanvasの実用的な使用例
const result = instance.createCanvas(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupCanvasEvents

**シグネチャ**:
```javascript
 setupCanvasEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupCanvasEvents();

// setupCanvasEventsの実用的な使用例
const result = instance.setupCanvasEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupCharts

**シグネチャ**:
```javascript
 setupCharts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupCharts();

// setupChartsの実用的な使用例
const result = instance.setupCharts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startRendering

**シグネチャ**:
```javascript
 startRendering()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startRendering();

// startRenderingの実用的な使用例
const result = instance.startRendering(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.animationId)
```

**パラメーター**:
- `this.animationId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.animationId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.canvas.style.display !== 'none')
```

**パラメーター**:
- `this.canvas.style.display !== 'none'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.canvas.style.display !== 'none');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCharts

**シグネチャ**:
```javascript
 updateCharts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCharts();

// updateChartsの実用的な使用例
const result = instance.updateCharts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - this.chartState.lastUpdate < this.settings.updateInterval)
```

**パラメーター**:
- `now - this.chartState.lastUpdate < this.settings.updateInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.chartState.lastUpdate < this.settings.updateInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupOldData

**シグネチャ**:
```javascript
 cleanupOldData(currentTime)
```

**パラメーター**:
- `currentTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOldData(currentTime);

// cleanupOldDataの実用的な使用例
const result = instance.cleanupOldData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(chart => {
            if (chart.cleanupOldData)
```

**パラメーター**:
- `chart => {
            if (chart.cleanupOldData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(chart => {
            if (chart.cleanupOldData);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderCharts

**シグネチャ**:
```javascript
 renderCharts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderCharts();

// renderChartsの実用的な使用例
const result = instance.renderCharts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ホバー情報表示

**シグネチャ**:
```javascript
 if (this.chartState.hoverPoint)
```

**パラメーター**:
- `this.chartState.hoverPoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.chartState.hoverPoint);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderTitle

**シグネチャ**:
```javascript
 renderTitle(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderTitle(ctx);

// renderTitleの実用的な使用例
const result = instance.renderTitle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStatistics

**シグネチャ**:
```javascript
 renderStatistics(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStatistics(ctx);

// renderStatisticsの実用的な使用例
const result = instance.renderStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderHoverInfo

**シグネチャ**:
```javascript
 renderHoverInfo(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderHoverInfo(ctx);

// renderHoverInfoの実用的な使用例
const result = instance.renderHoverInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderAlerts

**シグネチャ**:
```javascript
 renderAlerts(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderAlerts(ctx);

// renderAlertsの実用的な使用例
const result = instance.renderAlerts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重要なアラート

**シグネチャ**:
```javascript
 if (criticalAnomalies.length > 0)
```

**パラメーター**:
- `criticalAnomalies.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(criticalAnomalies.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

警告

**シグネチャ**:
```javascript
 if (warningAnomalies.length > 0)
```

**パラメーター**:
- `warningAnomalies.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(warningAnomalies.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleMouseMove

**シグネチャ**:
```javascript
 handleMouseMove(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleMouseMove(x, y);

// handleMouseMoveの実用的な使用例
const result = instance.handleMouseMove(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataPoint)
```

**パラメーター**:
- `dataPoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataPoint);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleMouseClick

**シグネチャ**:
```javascript
 handleMouseClick(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleMouseClick(x, y);

// handleMouseClickの実用的な使用例
const result = instance.handleMouseClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleWheel

**シグネチャ**:
```javascript
 handleWheel(deltaY)
```

**パラメーター**:
- `deltaY`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleWheel(deltaY);

// handleWheelの実用的な使用例
const result = instance.handleWheel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStatusFromValue

**シグネチャ**:
```javascript
 getStatusFromValue(value, threshold)
```

**パラメーター**:
- `value`
- `threshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatusFromValue(value, threshold);

// getStatusFromValueの実用的な使用例
const result = instance.getStatusFromValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggle

**シグネチャ**:
```javascript
 toggle()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggle();

// toggleの実用的な使用例
const result = instance.toggle(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(newSettings)
```

**パラメーター**:
- `newSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(newSettings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(chart => {
            if (chart.updateSettings)
```

**パラメーター**:
- `chart => {
            if (chart.updateSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(chart => {
            if (chart.updateSettings);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### captureScreenshot

**シグネチャ**:
```javascript
 captureScreenshot()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.captureScreenshot();

// captureScreenshotの実用的な使用例
const result = instance.captureScreenshot(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```

#### if

**シグネチャ**:
```javascript
 if (this.animationId)
```

**パラメーター**:
- `this.animationId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.animationId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.canvas && this.canvas.parentNode)
```

**パラメーター**:
- `this.canvas && this.canvas.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.canvas && this.canvas.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## PerformanceChart

### コンストラクタ

```javascript
new PerformanceChart(config)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `config` | 説明なし |
| `data` | 説明なし |
| `maxDataPoints` | 説明なし |
| `data` | 説明なし |

### メソッド

#### addDataPoint

**シグネチャ**:
```javascript
 addDataPoint(dataPoint)
```

**パラメーター**:
- `dataPoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addDataPoint(dataPoint);

// addDataPointの実用的な使用例
const result = instance.addDataPoint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

データポイント数制限

**シグネチャ**:
```javascript
 if (this.data.length > this.maxDataPoints)
```

**パラメーター**:
- `this.data.length > this.maxDataPoints`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.length > this.maxDataPoints);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(ctx, globalSettings)
```

**パラメーター**:
- `ctx`
- `globalSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(ctx, globalSettings);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### if

現在値表示

**シグネチャ**:
```javascript
 if (this.data.length > 0)
```

**パラメーター**:
- `this.data.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

グリッド描画

**シグネチャ**:
```javascript
 if (this.config.showGrid)
```

**パラメーター**:
- `this.config.showGrid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.showGrid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

閾値線描画

**シグネチャ**:
```javascript
 if (this.config.showThresholds && this.data.length > 0)
```

**パラメーター**:
- `this.config.showThresholds && this.data.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.showThresholds && this.data.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

データ線描画

**シグネチャ**:
```javascript
 if (this.data.length > 1)
```

**パラメーター**:
- `this.data.length > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.data.length > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderGrid

**シグネチャ**:
```javascript
 renderGrid(ctx, globalSettings)
```

**パラメーター**:
- `ctx`
- `globalSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderGrid(ctx, globalSettings);

// renderGridの実用的な使用例
const result = instance.renderGrid(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

水平グリッド

**シグネチャ**:
```javascript
 for (let i = 1; i < gridLines; i++)
```

**パラメーター**:
- `let i = 1; i < gridLines; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < gridLines; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

垂直グリッド

**シグネチャ**:
```javascript
 for (let i = 1; i < gridLines; i++)
```

**パラメーター**:
- `let i = 1; i < gridLines; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 1; i < gridLines; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderThresholds

**シグネチャ**:
```javascript
 renderThresholds(ctx, globalSettings)
```

**パラメーター**:
- `ctx`
- `globalSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderThresholds(ctx, globalSettings);

// renderThresholdsの実用的な使用例
const result = instance.renderThresholds(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lastDataPoint.threshold.warning)
```

**パラメーター**:
- `lastDataPoint.threshold.warning`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lastDataPoint.threshold.warning);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (lastDataPoint.threshold.critical)
```

**パラメーター**:
- `lastDataPoint.threshold.critical`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lastDataPoint.threshold.critical);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderDataLine

**シグネチャ**:
```javascript
 renderDataLine(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderDataLine(ctx);

// renderDataLineの実用的な使用例
const result = instance.renderDataLine(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

30秒

**シグネチャ**:
```javascript
 for (let i = 0; i < this.data.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.data.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.data.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (firstPoint)
```

**パラメーター**:
- `firstPoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(firstPoint);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isPointInChart

**シグネチャ**:
```javascript
 isPointInChart(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isPointInChart(x, y);

// isPointInChartの実用的な使用例
const result = instance.isPointInChart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDataPointAt

**シグネチャ**:
```javascript
 getDataPointAt(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDataPointAt(x, y);

// getDataPointAtの実用的な使用例
const result = instance.getDataPointAt(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const dataPoint of this.data)
```

**パラメーター**:
- `const dataPoint of this.data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const dataPoint of this.data);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (distance < minDistance)
```

**パラメーター**:
- `distance < minDistance`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(distance < minDistance);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupOldData

**シグネチャ**:
```javascript
 cleanupOldData(cutoffTime)
```

**パラメーター**:
- `cutoffTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOldData(cutoffTime);

// cleanupOldDataの実用的な使用例
const result = instance.cleanupOldData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(settings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## PerformanceHeatmap

### コンストラクタ

```javascript
new PerformanceHeatmap(config)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `config` | 説明なし |
| `heatmapData` | 説明なし |
| `colorScale` | 説明なし |
| `heatmapData` | 説明なし |
| `heatmapData` | 説明なし |

### メソッド

#### updateHeatmap

**シグネチャ**:
```javascript
 updateHeatmap(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateHeatmap(data);

// updateHeatmapの実用的な使用例
const result = instance.updateHeatmap(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePerformanceScore

**シグネチャ**:
```javascript
 calculatePerformanceScore(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePerformanceScore(data);

// calculatePerformanceScoreの実用的な使用例
const result = instance.calculatePerformanceScore(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(ctx, globalSettings)
```

**パラメーター**:
- `ctx`
- `globalSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(ctx, globalSettings);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### renderHeatmapCells

**シグネチャ**:
```javascript
 renderHeatmapCells(ctx)
```

**パラメーター**:
- `ctx`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderHeatmapCells(ctx);

// renderHeatmapCellsの実用的な使用例
const result = instance.renderHeatmapCells(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let row = 0; row < rows; row++)
```

**パラメーター**:
- `let row = 0; row < rows; row++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let row = 0; row < rows; row++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let col = 0; col < cols; col++)
```

**パラメーター**:
- `let col = 0; col < cols; col++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let col = 0; col < cols; col++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (score >= 0)
```

**パラメーター**:
- `score >= 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(score >= 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getScoreForCell

**シグネチャ**:
```javascript
 getScoreForCell(targetTime, yPosition)
```

**パラメーター**:
- `targetTime`
- `yPosition`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getScoreForCell(targetTime, yPosition);

// getScoreForCellの実用的な使用例
const result = instance.getScoreForCell(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### interpolateColor

**シグネチャ**:
```javascript
 interpolateColor(value)
```

**パラメーター**:
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.interpolateColor(value);

// interpolateColorの実用的な使用例
const result = instance.interpolateColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

値に基づいて色を補間

**シグネチャ**:
```javascript
 for (let i = 0; i < this.colorScale.length - 1; i++)
```

**パラメーター**:
- `let i = 0; i < this.colorScale.length - 1; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.colorScale.length - 1; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value >= current.value && value <= next.value)
```

**パラメーター**:
- `value >= current.value && value <= next.value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value >= current.value && value <= next.value);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderColorScale

**シグネチャ**:
```javascript
 renderColorScale(ctx, globalSettings)
```

**パラメーター**:
- `ctx`
- `globalSettings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderColorScale(ctx, globalSettings);

// renderColorScaleの実用的な使用例
const result = instance.renderColorScale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

カラースケール描画

**シグネチャ**:
```javascript
 for (let i = 0; i < scaleWidth; i++)
```

**パラメーター**:
- `let i = 0; i < scaleWidth; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < scaleWidth; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupOldData

**シグネチャ**:
```javascript
 cleanupOldData(cutoffTime)
```

**パラメーター**:
- `cutoffTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOldData(cutoffTime);

// cleanupOldDataの実用的な使用例
const result = instance.cleanupOldData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `rect` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `render` | 説明なし |
| `now` | 説明なし |
| `metrics` | 説明なし |
| `historyData` | 説明なし |
| `fpsChart` | 説明なし |
| `memoryChart` | 説明なし |
| `frameTimeChart` | 説明なし |
| `drawCallsChart` | 説明なし |
| `entitiesChart` | 説明なし |
| `heatmap` | 説明なし |
| `cutoffTime` | 説明なし |
| `ctx` | 説明なし |
| `canvas` | 説明なし |
| `stats` | 説明なし |
| `y` | 説明なし |
| `statsText` | 説明なし |
| `hover` | 説明なし |
| `boxWidth` | 説明なし |
| `boxHeight` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `lines` | 説明なし |
| `analysis` | 説明なし |
| `alertY` | 説明なし |
| `criticalAnomalies` | 説明なし |
| `warningAnomalies` | 説明なし |
| `dataPoint` | 説明なし |
| `zoomFactor` | 説明なし |
| `isVisible` | 説明なし |
| `dataURL` | 説明なし |
| `link` | 説明なし |
| `pos` | 説明なし |
| `currentValue` | 説明なし |
| `valueText` | 説明なし |
| `pos` | 説明なし |
| `gridLines` | 説明なし |
| `y` | 説明なし |
| `x` | 説明なし |
| `pos` | 説明なし |
| `lastDataPoint` | 説明なし |
| `drawThresholdLine` | 説明なし |
| `y` | 説明なし |
| `pos` | 説明なし |
| `valueRange` | 説明なし |
| `now` | 説明なし |
| `timeWindow` | 説明なし |
| `dataPoint` | 説明なし |
| `age` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `pos` | 説明なし |
| `pos` | 説明なし |
| `relativeX` | 説明なし |
| `timeWindow` | 説明なし |
| `now` | 説明なし |
| `targetTime` | 説明なし |
| `distance` | 説明なし |
| `normalizedScore` | 説明なし |
| `cutoffTime` | 説明なし |
| `pos` | 説明なし |
| `pos` | 説明なし |
| `cellSize` | 説明なし |
| `cols` | 説明なし |
| `rows` | 説明なし |
| `now` | 説明なし |
| `timeWindow` | 説明なし |
| `cellTime` | 説明なし |
| `cellY` | 説明なし |
| `score` | 説明なし |
| `color` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `timeTolerances` | 説明なし |
| `relevantData` | 説明なし |
| `closest` | 説明なし |
| `current` | 説明なし |
| `next` | 説明なし |
| `ratio` | 説明なし |
| `pos` | 説明なし |
| `scaleWidth` | 説明なし |
| `scaleHeight` | 説明なし |
| `scaleX` | 説明なし |
| `scaleY` | 説明なし |
| `value` | 説明なし |
| `color` | 説明なし |

---

