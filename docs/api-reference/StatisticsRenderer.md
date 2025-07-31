# StatisticsRenderer

## 概要

ファイル: `scenes/components/StatisticsRenderer.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [StatisticsRenderer](#statisticsrenderer)
## 定数
- [baseSize](#basesize)
- [sectionHeight](#sectionheight)
- [layout](#layout)
- [columnWidth](#columnwidth)
- [basic](#basic)
- [items](#items)
- [bubbles](#bubbles)
- [items](#items)
- [lineHeight](#lineheight)
- [item](#item)
- [combos](#combos)
- [items](#items)
- [stages](#stages)
- [items](#items)
- [adjustedLineHeight](#adjustedlineheight)
- [sortedTypes](#sortedtypes)
- [smallLineHeight](#smalllineheight)
- [typeName](#typename)
- [count](#count)
- [errorText](#errortext)
- [typeNames](#typenames)

---

## StatisticsRenderer

### コンストラクタ

```javascript
new StatisticsRenderer(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `eventBus` | 説明なし |
| `state` | 説明なし |
| `errorHandler` | エラーハンドリング |
| `accessibilitySettings` | アクセシビリティ設定 |
| `contentPadding` | レイアウト設定 |
| `sectionHeight` | 説明なし |
| `lineHeight` | 説明なし |
| `scrollPosition` | 説明なし |
| `statisticsData` | 統計データ |
| `colors` | スタイル設定 |
| `fonts` | 説明なし |
| `statisticsData` | 説明なし |
| `scrollPosition` | 説明なし |
| `statisticsData` | データのクリア |

### メソッド

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

#### getColorScheme

**シグネチャ**:
```javascript
 getColorScheme()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getColorScheme();

// getColorSchemeの実用的な使用例
const result = instance.getColorScheme(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.accessibilitySettings.highContrast)
```

**パラメーター**:
- `this.accessibilitySettings.highContrast`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.accessibilitySettings.highContrast);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFontScheme

**シグネチャ**:
```javascript
 getFontScheme()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFontScheme();

// getFontSchemeの実用的な使用例
const result = instance.getFontScheme(/* 適切なパラメータ */);
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

#### renderDetailedStatistics

**シグネチャ**:
```javascript
 renderDetailedStatistics(context, x, y, width, height)
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
const result = instance.renderDetailedStatistics(context, x, y, width, height);

// renderDetailedStatisticsの実用的な使用例
const result = instance.renderDetailedStatistics(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (layout.columns === 1)
```

**パラメーター**:
- `layout.columns === 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(layout.columns === 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderBasicStatsSection

**シグネチャ**:
```javascript
 renderBasicStatsSection(context, x, y, width, height)
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
const result = instance.renderBasicStatsSection(context, x, y, width, height);

// renderBasicStatsSectionの実用的な使用例
const result = instance.renderBasicStatsSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.statisticsData || !this.statisticsData.basic)
```

**パラメーター**:
- `!this.statisticsData || !this.statisticsData.basic`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.statisticsData || !this.statisticsData.basic);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderBubbleStatsSection

**シグネチャ**:
```javascript
 renderBubbleStatsSection(context, x, y, width, height)
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
const result = instance.renderBubbleStatsSection(context, x, y, width, height);

// renderBubbleStatsSectionの実用的な使用例
const result = instance.renderBubbleStatsSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.statisticsData || !this.statisticsData.bubbles)
```

**パラメーター**:
- `!this.statisticsData || !this.statisticsData.bubbles`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.statisticsData || !this.statisticsData.bubbles);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderComboStatsSection

**シグネチャ**:
```javascript
 renderComboStatsSection(context, x, y, width, height)
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
const result = instance.renderComboStatsSection(context, x, y, width, height);

// renderComboStatsSectionの実用的な使用例
const result = instance.renderComboStatsSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.statisticsData || !this.statisticsData.combos)
```

**パラメーター**:
- `!this.statisticsData || !this.statisticsData.combos`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.statisticsData || !this.statisticsData.combos);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStageStatsSection

**シグネチャ**:
```javascript
 renderStageStatsSection(context, x, y, width, height)
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
const result = instance.renderStageStatsSection(context, x, y, width, height);

// renderStageStatsSectionの実用的な使用例
const result = instance.renderStageStatsSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.statisticsData || !this.statisticsData.stages)
```

**パラメーター**:
- `!this.statisticsData || !this.statisticsData.stages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.statisticsData || !this.statisticsData.stages);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderStatsList

**シグネチャ**:
```javascript
 renderStatsList(context, items, x, y, width, lineHeight)
```

**パラメーター**:
- `context`
- `items`
- `x`
- `y`
- `width`
- `lineHeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderStatsList(context, items, x, y, width, lineHeight);

// renderStatsListの実用的な使用例
const result = instance.renderStatsList(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const item of items)
```

**パラメーター**:
- `const item of items`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const item of items);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### renderBubbleTypeBreakdown

**シグネチャ**:
```javascript
 renderBubbleTypeBreakdown(context, typeBreakdown, x, y, width)
```

**パラメーター**:
- `context`
- `typeBreakdown`
- `x`
- `y`
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderBubbleTypeBreakdown(context, typeBreakdown, x, y, width);

// renderBubbleTypeBreakdownの実用的な使用例
const result = instance.renderBubbleTypeBreakdown(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [type, data] of sortedTypes)
```

**パラメーター**:
- `const [type`
- `data] of sortedTypes`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [type, data] of sortedTypes);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### renderErrorFallback

**シグネチャ**:
```javascript
 renderErrorFallback(context, x, y, width, height, error)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`
- `height`
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderErrorFallback(context, x, y, width, height, error);

// renderErrorFallbackの実用的な使用例
const result = instance.renderErrorFallback(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デバッグ情報（開発時のみ）

**シグネチャ**:
```javascript
 if (this.gameEngine.debugMode)
```

**パラメーター**:
- `this.gameEngine.debugMode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine.debugMode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBubbleTypeName

**シグネチャ**:
```javascript
 getBubbleTypeName(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBubbleTypeName(type);

// getBubbleTypeNameの実用的な使用例
const result = instance.getBubbleTypeName(/* 適切なパラメータ */);
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

## 定数

| 定数名 | 説明 |
|--------|------|
| `baseSize` | 説明なし |
| `sectionHeight` | 説明なし |
| `layout` | 説明なし |
| `columnWidth` | 説明なし |
| `basic` | 説明なし |
| `items` | 説明なし |
| `bubbles` | 説明なし |
| `items` | 説明なし |
| `lineHeight` | 説明なし |
| `item` | 説明なし |
| `combos` | 説明なし |
| `items` | 説明なし |
| `stages` | 説明なし |
| `items` | 説明なし |
| `adjustedLineHeight` | 説明なし |
| `sortedTypes` | 説明なし |
| `smallLineHeight` | 説明なし |
| `typeName` | 説明なし |
| `count` | 説明なし |
| `errorText` | 説明なし |
| `typeNames` | 説明なし |

---

