# StatisticsTab

## 概要

ファイル: `scenes/components/StatisticsTab.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [StatisticsTab](#statisticstab)
## 定数
- [statisticsManager](#statisticsmanager)
- [contentWidth](#contentwidth)
- [filterHeight](#filterheight)
- [availableHeight](#availableheight)
- [message](#message)
- [message](#message)

---

## StatisticsTab

**継承元**: `TabComponent`

### コンストラクタ

```javascript
new StatisticsTab(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `statisticsViewMode` | 統計表示設定 |
| `currentPeriodFilter` | 'dashboard', 'charts', 'details' |
| `statisticsDisplaySettings` | 統計表示設定 |
| `filterUI` | 子コンポーネント |
| `statisticsRenderer` | 説明なし |
| `dashboardRenderer` | 説明なし |
| `statisticsData` | 統計データ |
| `contentPadding` | レイアウト設定 |
| `filterUI` | 子コンポーネントの初期化 |
| `statisticsRenderer` | 説明なし |
| `dashboardRenderer` | 説明なし |
| `currentPeriodFilter` | 説明なし |
| `statisticsViewMode` | 説明なし |
| `statisticsData` | 説明なし |
| `statisticsData` | 説明なし |
| `statisticsData` | 期間フィルターに基づいてデータを取得 |
| `statisticsData` | 説明なし |
| `statisticsViewMode` | 説明なし |
| `currentPeriodFilter` | 説明なし |

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

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupEventListeners

**シグネチャ**:
```javascript
 setupEventListeners()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupEventListeners();

// setupEventListenersの実用的な使用例
const result = instance.setupEventListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadStatisticsData

**シグネチャ**:
```javascript
async loadStatisticsData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadStatisticsData();

// loadStatisticsDataの実用的な使用例
const result = instance.loadStatisticsData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!statisticsManager)
```

**パラメーター**:
- `!statisticsManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!statisticsManager);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### render

**シグネチャ**:
```javascript
 render(context, x, y, width, height)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context, x, y, width, height);

// 描画処理
const ctx = canvas.getContext('2d');
instance.render(ctx);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStatistics

**シグネチャ**:
```javascript
 renderStatistics(context, x, y, width, height)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStatistics(context, x, y, width, height);

// renderStatisticsの実用的な使用例
const result = instance.renderStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計フィルターUIの描画

**シグネチャ**:
```javascript
 if (this.filterUI)
```

**パラメーター**:
- `this.filterUI`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.filterUI);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.statisticsData)
```

**パラメーター**:
- `!this.statisticsData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.statisticsData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

統計表示モードに応じて描画

**シグネチャ**:
```javascript
 switch (this.statisticsViewMode)
```

**パラメーター**:
- `this.statisticsViewMode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.statisticsViewMode);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dashboardRenderer)
```

**パラメーター**:
- `this.dashboardRenderer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dashboardRenderer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.statisticsRenderer)
```

**パラメーター**:
- `this.statisticsRenderer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsRenderer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderNoDataMessage

**シグネチャ**:
```javascript
 renderNoDataMessage(context, x, y, width, height)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderNoDataMessage(context, x, y, width, height);

// renderNoDataMessageの実用的な使用例
const result = instance.renderNoDataMessage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStatisticsCharts

**シグネチャ**:
```javascript
 renderStatisticsCharts(context, x, y, width, height)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStatisticsCharts(context, x, y, width, height);

// renderStatisticsChartsの実用的な使用例
const result = instance.renderStatisticsCharts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleClick

**シグネチャ**:
```javascript
 handleClick(x, y)
```

**パラメーター**:
- `x`
- `y`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleClick(x, y);

// handleClickの実用的な使用例
const result = instance.handleClick(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フィルターUIのクリック処理

**シグネチャ**:
```javascript
 if (this.filterUI && this.filterUI.handleClick)
```

**パラメーター**:
- `this.filterUI && this.filterUI.handleClick`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.filterUI && this.filterUI.handleClick);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ダッシュボードレンダラーのクリック処理

**シグネチャ**:
```javascript
 if (this.dashboardRenderer && this.dashboardRenderer.handleClick)
```

**パラメーター**:
- `this.dashboardRenderer && this.dashboardRenderer.handleClick`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dashboardRenderer && this.dashboardRenderer.handleClick);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計レンダラーのクリック処理

**シグネチャ**:
```javascript
 if (this.statisticsRenderer && this.statisticsRenderer.handleClick)
```

**パラメーター**:
- `this.statisticsRenderer && this.statisticsRenderer.handleClick`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsRenderer && this.statisticsRenderer.handleClick);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### update

**シグネチャ**:
```javascript
 update(deltaTime)
```

**パラメーター**:
- `deltaTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.update(deltaTime);

// フレーム更新処理
const deltaTime = 16.67; // 60FPS
instance.update(deltaTime);
```

#### if

子コンポーネントの更新

**シグネチャ**:
```javascript
 if (this.filterUI && this.filterUI.update)
```

**パラメーター**:
- `this.filterUI && this.filterUI.update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.filterUI && this.filterUI.update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dashboardRenderer && this.dashboardRenderer.update)
```

**パラメーター**:
- `this.dashboardRenderer && this.dashboardRenderer.update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dashboardRenderer && this.dashboardRenderer.update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.statisticsRenderer && this.statisticsRenderer.update)
```

**パラメーター**:
- `this.statisticsRenderer && this.statisticsRenderer.update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsRenderer && this.statisticsRenderer.update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getResponsiveLayout

**シグネチャ**:
```javascript
 getResponsiveLayout(screenWidth)
```

**パラメーター**:
- `screenWidth`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getResponsiveLayout(screenWidth);

// getResponsiveLayoutの実用的な使用例
const result = instance.getResponsiveLayout(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (screenWidth < 600)
```

**パラメーター**:
- `screenWidth < 600`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(screenWidth < 600);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (screenWidth < 800)
```

**パラメーター**:
- `screenWidth < 800`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(screenWidth < 800);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setViewMode

**シグネチャ**:
```javascript
 setViewMode(mode)
```

**パラメーター**:
- `mode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setViewMode(mode);

// setViewModeの実用的な使用例
const result = instance.setViewMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setPeriodFilter

**シグネチャ**:
```javascript
 setPeriodFilter(period)
```

**パラメーター**:
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setPeriodFilter(period);

// setPeriodFilterの実用的な使用例
const result = instance.setPeriodFilter(/* 適切なパラメータ */);
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

#### if

子コンポーネントのクリーンアップ

**シグネチャ**:
```javascript
 if (this.filterUI && this.filterUI.cleanup)
```

**パラメーター**:
- `this.filterUI && this.filterUI.cleanup`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.filterUI && this.filterUI.cleanup);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.statisticsRenderer && this.statisticsRenderer.cleanup)
```

**パラメーター**:
- `this.statisticsRenderer && this.statisticsRenderer.cleanup`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsRenderer && this.statisticsRenderer.cleanup);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.dashboardRenderer && this.dashboardRenderer.cleanup)
```

**パラメーター**:
- `this.dashboardRenderer && this.dashboardRenderer.cleanup`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dashboardRenderer && this.dashboardRenderer.cleanup);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `statisticsManager` | 説明なし |
| `contentWidth` | 説明なし |
| `filterHeight` | 説明なし |
| `availableHeight` | 説明なし |
| `message` | 説明なし |
| `message` | 説明なし |

---

