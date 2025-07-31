# PerformanceChart

## 概要

ファイル: `debug/charts/PerformanceChart.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [PerformanceChart](#performancechart)
## 定数
- [key](#key)
- [value](#value)
- [now](#now)
- [y](#y)
- [verticalLines](#verticallines)
- [x](#x)
- [y](#y)
- [x](#x)
- [y](#y)
- [latestPoint](#latestpoint)
- [x](#x)
- [y](#y)
- [value](#value)
- [y](#y)
- [timeLabels](#timelabels)
- [x](#x)
- [values](#values)
- [min](#min)
- [max](#max)
- [avg](#avg)
- [normalizedValue](#normalizedvalue)
- [ratio](#ratio)
- [values](#values)
- [min](#min)
- [max](#max)
- [avg](#avg)
- [current](#current)

---

## PerformanceChart

### コンストラクタ

```javascript
new PerformanceChart(canvas, config)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `canvas` | 説明なし |
| `ctx` | 説明なし |
| `config` | 説明なし |
| `dataPoints` | データポイント |
| `maxDataPoints` | 説明なし |
| `padding` | 描画設定 |
| `chartArea` | 説明なし |
| `animationId` | アニメーション |
| `lastUpdate` | 説明なし |
| `lastUpdate` | 説明なし |
| `dataPoints` | 説明なし |
| `chartArea` | 説明なし |
| `dataPoints` | 説明なし |
| `ctx` | 説明なし |
| `canvas` | 説明なし |

### メソッド

#### setupCanvas

**シグネチャ**:
```javascript
 setupCanvas()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupCanvas();

// setupCanvasの実用的な使用例
const result = instance.setupCanvas(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(metrics)
```

**パラメーター**:
- `metrics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(metrics);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

データポイント数の制限

**シグネチャ**:
```javascript
 if (this.dataPoints.length > this.maxDataPoints)
```

**パラメーター**:
- `this.dataPoints.length > this.maxDataPoints`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dataPoints.length > this.maxDataPoints);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

適度な頻度で再描画

**シグネチャ**:
```javascript
 if (now - this.lastUpdate > 50)
```

**パラメーター**:
- `now - this.lastUpdate > 50`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.lastUpdate > 50);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### clear

**シグネチャ**:
```javascript
 clear()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clear();

// clearの実用的な使用例
const result = instance.clear(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawBackground

**シグネチャ**:
```javascript
 drawBackground()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawBackground();

// drawBackgroundの実用的な使用例
const result = instance.drawBackground(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawGrid

**シグネチャ**:
```javascript
 drawGrid()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawGrid();

// drawGridの実用的な使用例
const result = instance.drawGrid(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

水平グリッド線

**シグネチャ**:
```javascript
 for (let i = 0; i <= this.config.gridLines; i++)
```

**パラメーター**:
- `let i = 0; i <= this.config.gridLines; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= this.config.gridLines; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= verticalLines; i++)
```

**パラメーター**:
- `let i = 0; i <= verticalLines; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= verticalLines; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawThresholdLines

**シグネチャ**:
```javascript
 drawThresholdLines()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawThresholdLines();

// drawThresholdLinesの実用的な使用例
const result = instance.drawThresholdLines(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawThresholdLine

**シグネチャ**:
```javascript
 drawThresholdLine(value, color, label)
```

**パラメーター**:
- `value`
- `color`
- `label`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawThresholdLine(value, color, label);

// drawThresholdLineの実用的な使用例
const result = instance.drawThresholdLine(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawDataLine

**シグネチャ**:
```javascript
 drawDataLine()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawDataLine();

// drawDataLineの実用的な使用例
const result = instance.drawDataLine(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < this.dataPoints.length; i++)
```

**パラメーター**:
- `let i = 0; i < this.dataPoints.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < this.dataPoints.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (i === 0)
```

**パラメーター**:
- `i === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(i === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

エリア塗りつぶし

**シグネチャ**:
```javascript
 if (this.config.backgroundColor)
```

**パラメーター**:
- `this.config.backgroundColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.backgroundColor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawDataPoints

**シグネチャ**:
```javascript
 drawDataPoints()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawDataPoints();

// drawDataPointsの実用的な使用例
const result = instance.drawDataPoints(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawLabels

**シグネチャ**:
```javascript
 drawLabels()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawLabels();

// drawLabelsの実用的な使用例
const result = instance.drawLabels(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i <= this.config.gridLines; i++)
```

**パラメーター**:
- `let i = 0; i <= this.config.gridLines; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i <= this.config.gridLines; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < timeLabels.length; i++)
```

**パラメーター**:
- `let i = 0; i < timeLabels.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < timeLabels.length; i++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### drawLegend

**シグネチャ**:
```javascript
 drawLegend()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.drawLegend();

// drawLegendの実用的な使用例
const result = instance.drawLegend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計情報

**シグネチャ**:
```javascript
 if (this.dataPoints.length > 0)
```

**パラメーター**:
- `this.dataPoints.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dataPoints.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### valueToY

**シグネチャ**:
```javascript
 valueToY(value)
```

**パラメーター**:
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.valueToY(value);

// valueToYの実用的な使用例
const result = instance.valueToY(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### indexToX

**シグネチャ**:
```javascript
 indexToX(index)
```

**パラメーター**:
- `index`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.indexToX(index);

// indexToXの実用的な使用例
const result = instance.indexToX(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dataPoints.length <= 1)
```

**パラメーター**:
- `this.dataPoints.length <= 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dataPoints.length <= 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateThresholds

**シグネチャ**:
```javascript
 updateThresholds(warning, critical)
```

**パラメーター**:
- `warning`
- `critical`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateThresholds(warning, critical);

// updateThresholdsの実用的な使用例
const result = instance.updateThresholds(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setRange

**シグネチャ**:
```javascript
 setRange(min, max)
```

**パラメーター**:
- `min`
- `max`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setRange(min, max);

// setRangeの実用的な使用例
const result = instance.setRange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dataPoints.length > this.maxDataPoints)
```

**パラメーター**:
- `this.dataPoints.length > this.maxDataPoints`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dataPoints.length > this.maxDataPoints);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearData

**シグネチャ**:
```javascript
 clearData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearData();

// clearDataの実用的な使用例
const result = instance.clearData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStatistics

**シグネチャ**:
```javascript
 getStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatistics();

// getStatisticsの実用的な使用例
const result = instance.getStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dataPoints.length === 0)
```

**パラメーター**:
- `this.dataPoints.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dataPoints.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resize

**シグネチャ**:
```javascript
 resize(width, height)
```

**パラメーター**:
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resize(width, height);

// resizeの実用的な使用例
const result = instance.resize(/* 適切なパラメータ */);
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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `key` | 説明なし |
| `value` | 説明なし |
| `now` | 説明なし |
| `y` | 説明なし |
| `verticalLines` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `latestPoint` | 説明なし |
| `x` | 説明なし |
| `y` | 説明なし |
| `value` | 説明なし |
| `y` | 説明なし |
| `timeLabels` | 説明なし |
| `x` | 説明なし |
| `values` | 説明なし |
| `min` | 説明なし |
| `max` | 説明なし |
| `avg` | 説明なし |
| `normalizedValue` | 説明なし |
| `ratio` | 説明なし |
| `values` | 説明なし |
| `min` | 説明なし |
| `max` | 説明なし |
| `avg` | 説明なし |
| `current` | 説明なし |

---

