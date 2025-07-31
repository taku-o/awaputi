# I18nRenderOptimizer

## 概要

ファイル: `core/i18n/I18nRenderOptimizer.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [I18nRenderOptimizer](#i18nrenderoptimizer)
## 定数
- [startTime](#starttime)
- [layoutInfo](#layoutinfo)
- [updateResult](#updateresult)
- [endTime](#endtime)
- [renderTime](#rendertime)
- [fontFamily](#fontfamily)
- [loadPromise](#loadpromise)
- [fontFace](#fontface)
- [link](#link)
- [cacheKey](#cachekey)
- [layoutInfo](#layoutinfo)
- [fontFamily](#fontfamily)
- [cacheKey](#cachekey)
- [testElement](#testelement)
- [metrics](#metrics)
- [testChars](#testchars)
- [testWords](#testwords)
- [lengthFactors](#lengthfactors)
- [adjustments](#adjustments)
- [virtualUpdates](#virtualupdates)
- [updates](#updates)
- [elements](#elements)
- [update](#update)
- [currentText](#currenttext)
- [currentAttrs](#currentattrs)
- [newText](#newtext)
- [newAttrs](#newattrs)
- [sortedUpdates](#sortedupdates)
- [fragment](#fragment)
- [batchTime](#batchtime)
- [style](#style)
- [style](#style)
- [startTime](#starttime)
- [updates](#updates)
- [endTime](#endtime)
- [frameTime](#frametime)
- [viewport](#viewport)
- [commonFonts](#commonfonts)
- [preloadPromises](#preloadpromises)
- [mediaQueries](#mediaqueries)
- [fontMap](#fontmap)
- [reverseMap](#reversemap)
- [rtlLanguages](#rtllanguages)
- [alpha](#alpha)

---

## I18nRenderOptimizer

### コンストラクタ

```javascript
new I18nRenderOptimizer()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `optimization` | レンダリング最適化設定 |
| `renderQueue` | レンダリングキュー |
| `isRendering` | 説明なし |
| `renderRequestId` | 説明なし |
| `fontCache` | フォント管理 |
| `fontLoadPromises` | 説明なし |
| `preloadedFonts` | 説明なし |
| `layoutCache` | レイアウトキャッシュ |
| `measurementCache` | 説明なし |
| `renderMetrics` | パフォーマンス監視 |
| `domOptimization` | DOM 最適化 |
| `elementPools` | 要素プール |
| `scheduleRender` | requestAnimationFrame による最適化 |
| `deferLayoutMeasurements` | レイアウト測定の遅延 |
| `batchStartTime` | DOM 更新の最適化 |
| `deferLayoutMeasurements` | レイアウト測定の再開 |
| `animationDisabled` | 説明なし |
| `animationDisabled` | 説明なし |
| `isRendering` | 説明なし |
| `renderRequestId` | 説明なし |
| `isRendering` | 説明なし |
| `renderRequestId` | 説明なし |
| `renderingPaused` | 説明なし |
| `renderingPaused` | 説明なし |

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

#### setupRenderingOptimization

**シグネチャ**:
```javascript
 setupRenderingOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupRenderingOptimization();

// setupRenderingOptimizationの実用的な使用例
const result = instance.setupRenderingOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (document.hidden)
```

**パラメーター**:
- `document.hidden`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.hidden);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeLanguageSwitch

**シグネチャ**:
```javascript
async optimizeLanguageSwitch(fromLanguage, toLanguage, updateCallback)
```

**パラメーター**:
- `fromLanguage`
- `toLanguage`
- `updateCallback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeLanguageSwitch(fromLanguage, toLanguage, updateCallback);

// optimizeLanguageSwitchの実用的な使用例
const result = instance.optimizeLanguageSwitch(/* 適切なパラメータ */);
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

#### preloadLanguageFonts

**シグネチャ**:
```javascript
async preloadLanguageFonts(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preloadLanguageFonts(language);

// preloadLanguageFontsの実用的な使用例
const result = instance.preloadLanguageFonts(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (!document.fonts)
```

**パラメーター**:
- `!document.fonts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!document.fonts);

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

#### precalculateLayout

**シグネチャ**:
```javascript
async precalculateLayout(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.precalculateLayout(language);

// precalculateLayoutの実用的な使用例
const result = instance.precalculateLayout(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateFontMetrics

**シグネチャ**:
```javascript
async calculateFontMetrics(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateFontMetrics(language);

// calculateFontMetricsの実用的な使用例
const result = instance.calculateFontMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const char of testChars)
```

**パラメーター**:
- `const char of testChars`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const char of testChars);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const word of testWords)
```

**パラメーター**:
- `const word of testWords`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const word of testWords);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateTextLengths

**シグネチャ**:
```javascript
 estimateTextLengths(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateTextLengths(language);

// estimateTextLengthsの実用的な使用例
const result = instance.estimateTextLengths(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateLayoutAdjustments

**シグネチャ**:
```javascript
 calculateLayoutAdjustments(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateLayoutAdjustments(language);

// calculateLayoutAdjustmentsの実用的な使用例
const result = instance.calculateLayoutAdjustments(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

言語固有の調整

**シグネチャ**:
```javascript
 switch (language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(language);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startBatchUpdate

**シグネチャ**:
```javascript
 startBatchUpdate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startBatchUpdate();

// startBatchUpdateの実用的な使用例
const result = instance.startBatchUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeBatchedUpdate

**シグネチャ**:
```javascript
async executeBatchedUpdate(updateCallback, layoutInfo)
```

**パラメーター**:
- `updateCallback`
- `layoutInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeBatchedUpdate(updateCallback, layoutInfo);

// executeBatchedUpdateの実用的な使用例
const result = instance.executeBatchedUpdate(/* 適切なパラメータ */);
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

#### createVirtualUpdates

**シグネチャ**:
```javascript
async createVirtualUpdates(updateCallback, layoutInfo)
```

**パラメーター**:
- `updateCallback`
- `layoutInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createVirtualUpdates(updateCallback, layoutInfo);

// createVirtualUpdatesの実用的な使用例
const result = instance.createVirtualUpdates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of elements)
```

**パラメーター**:
- `const element of elements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of elements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (update)
```

**パラメーター**:
- `update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(update);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createElementUpdate

**シグネチャ**:
```javascript
async createElementUpdate(element, updateCallback, layoutInfo)
```

**パラメーター**:
- `element`
- `updateCallback`
- `layoutInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createElementUpdate(element, updateCallback, layoutInfo);

// createElementUpdateの実用的な使用例
const result = instance.createElementUpdate(/* 適切なパラメータ */);
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

#### applyVirtualUpdates

**シグネチャ**:
```javascript
async applyVirtualUpdates(updates)
```

**パラメーター**:
- `updates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyVirtualUpdates(updates);

// applyVirtualUpdatesの実用的な使用例
const result = instance.applyVirtualUpdates(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const update of sortedUpdates)
```

**パラメーター**:
- `const update of sortedUpdates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const update of sortedUpdates);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyElementUpdate

**シグネチャ**:
```javascript
async applyElementUpdate(update)
```

**パラメーター**:
- `update`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyElementUpdate(update);

// applyElementUpdateの実用的な使用例
const result = instance.applyElementUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

テキスト更新

**シグネチャ**:
```javascript
 if (element.textContent !== newText)
```

**パラメーター**:
- `element.textContent !== newText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element.textContent !== newText);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

レイアウト調整の適用

**シグネチャ**:
```javascript
 if (layoutInfo.adjustments)
```

**パラメーター**:
- `layoutInfo.adjustments`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(layoutInfo.adjustments);

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

#### finishBatchUpdate

**シグネチャ**:
```javascript
async finishBatchUpdate()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.finishBatchUpdate();

// finishBatchUpdateの実用的な使用例
const result = instance.finishBatchUpdate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disableAnimations

**シグネチャ**:
```javascript
 disableAnimations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disableAnimations();

// disableAnimationsの実用的な使用例
const result = instance.disableAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.animationDisabled)
```

**パラメーター**:
- `!this.animationDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.animationDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableAnimations

**シグネチャ**:
```javascript
 enableAnimations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableAnimations();

// enableAnimationsの実用的な使用例
const result = instance.enableAnimations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.animationDisabled)
```

**パラメーター**:
- `this.animationDisabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.animationDisabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (style)
```

**パラメーター**:
- `style`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(style);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeRenderQueue

**シグネチャ**:
```javascript
 executeRenderQueue()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeRenderQueue();

// executeRenderQueueの実用的な使用例
const result = instance.executeRenderQueue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isRendering || this.renderQueue.length === 0)
```

**パラメーター**:
- `this.isRendering || this.renderQueue.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isRendering || this.renderQueue.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッチ処理

**シグネチャ**:
```javascript
 if (this.optimization.batchUpdates)
```

**パラメーター**:
- `this.optimization.batchUpdates`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimization.batchUpdates);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

まだキューに残りがあれば継続

**シグネチャ**:
```javascript
 if (this.renderQueue.length > 0)
```

**パラメーター**:
- `this.renderQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.renderQueue.length > 0);

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

#### pauseRendering

**シグネチャ**:
```javascript
 pauseRendering()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.pauseRendering();

// pauseRenderingの実用的な使用例
const result = instance.pauseRendering(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.renderRequestId)
```

**パラメーター**:
- `this.renderRequestId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.renderRequestId);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resumeRendering

**シグネチャ**:
```javascript
 resumeRendering()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resumeRendering();

// resumeRenderingの実用的な使用例
const result = instance.resumeRendering(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.renderQueue.length > 0)
```

**パラメーター**:
- `this.renderQueue.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.renderQueue.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### optimizeForViewport

**シグネチャ**:
```javascript
 optimizeForViewport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.optimizeForViewport();

// optimizeForViewportの実用的な使用例
const result = instance.optimizeForViewport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

小さな画面での最適化

**シグネチャ**:
```javascript
 if (viewport.width < 768)
```

**パラメーター**:
- `viewport.width < 768`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(viewport.width < 768);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

高DPI ディスプレイでの最適化

**シグネチャ**:
```javascript
 if (viewport.devicePixelRatio > 1)
```

**パラメーター**:
- `viewport.devicePixelRatio > 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(viewport.devicePixelRatio > 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableMobileOptimizations

**シグネチャ**:
```javascript
 enableMobileOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableMobileOptimizations();

// enableMobileOptimizationsの実用的な使用例
const result = instance.enableMobileOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disableMobileOptimizations

**シグネチャ**:
```javascript
 disableMobileOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disableMobileOptimizations();

// disableMobileOptimizationsの実用的な使用例
const result = instance.disableMobileOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableHighDPIOptimizations

**シグネチャ**:
```javascript
 enableHighDPIOptimizations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableHighDPIOptimizations();

// enableHighDPIOptimizationsの実用的な使用例
const result = instance.enableHighDPIOptimizations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preloadCommonFonts

**シグネチャ**:
```javascript
async preloadCommonFonts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preloadCommonFonts();

// preloadCommonFontsの実用的な使用例
const result = instance.preloadCommonFonts(/* 適切なパラメータ */);
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

#### setupResponsiveOptimization

**シグネチャ**:
```javascript
 setupResponsiveOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupResponsiveOptimization();

// setupResponsiveOptimizationの実用的な使用例
const result = instance.setupResponsiveOptimization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getLanguageFontFamily

**シグネチャ**:
```javascript
 getLanguageFontFamily(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLanguageFontFamily(language);

// getLanguageFontFamilyの実用的な使用例
const result = instance.getLanguageFontFamily(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getLanguageByFont

**シグネチャ**:
```javascript
 getLanguageByFont(fontFamily)
```

**パラメーター**:
- `fontFamily`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLanguageByFont(fontFamily);

// getLanguageByFontの実用的な使用例
const result = instance.getLanguageByFont(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTextDirection

**シグネチャ**:
```javascript
 getTextDirection(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTextDirection(language);

// getTextDirectionの実用的な使用例
const result = instance.getTextDirection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### debounce

**シグネチャ**:
```javascript
 debounce(func, delay)
```

**パラメーター**:
- `func`
- `delay`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.debounce(func, delay);

// debounceの実用的な使用例
const result = instance.debounce(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateFrameMetrics

**シグネチャ**:
```javascript
 updateFrameMetrics(frameTime)
```

**パラメーター**:
- `frameTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFrameMetrics(frameTime);

// updateFrameMetricsの実用的な使用例
const result = instance.updateFrameMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

16.67ms (60FPS) を超えたフレームをドロップとしてカウント

**シグネチャ**:
```javascript
 67ms (60FPS)
```

**パラメーター**:
- `60FPS`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(60FPS);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateRenderMetrics

**シグネチャ**:
```javascript
 updateRenderMetrics(renderTime)
```

**パラメーター**:
- `renderTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateRenderMetrics(renderTime);

// updateRenderMetricsの実用的な使用例
const result = instance.updateRenderMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getPerformanceStats

**シグネチャ**:
```javascript
 getPerformanceStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getPerformanceStats();

// getPerformanceStatsの実用的な使用例
const result = instance.getPerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearCaches

**シグネチャ**:
```javascript
 clearCaches()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearCaches();

// clearCachesの実用的な使用例
const result = instance.clearCaches(/* 適切なパラメータ */);
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

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `layoutInfo` | 説明なし |
| `updateResult` | 説明なし |
| `endTime` | 説明なし |
| `renderTime` | 説明なし |
| `fontFamily` | 説明なし |
| `loadPromise` | 説明なし |
| `fontFace` | 説明なし |
| `link` | 説明なし |
| `cacheKey` | 説明なし |
| `layoutInfo` | 説明なし |
| `fontFamily` | 説明なし |
| `cacheKey` | 説明なし |
| `testElement` | 説明なし |
| `metrics` | 説明なし |
| `testChars` | 説明なし |
| `testWords` | 説明なし |
| `lengthFactors` | 説明なし |
| `adjustments` | 説明なし |
| `virtualUpdates` | 説明なし |
| `updates` | 説明なし |
| `elements` | 説明なし |
| `update` | 説明なし |
| `currentText` | 説明なし |
| `currentAttrs` | 説明なし |
| `newText` | 説明なし |
| `newAttrs` | 説明なし |
| `sortedUpdates` | 説明なし |
| `fragment` | 説明なし |
| `batchTime` | 説明なし |
| `style` | 説明なし |
| `style` | 説明なし |
| `startTime` | 説明なし |
| `updates` | 説明なし |
| `endTime` | 説明なし |
| `frameTime` | 説明なし |
| `viewport` | 説明なし |
| `commonFonts` | 説明なし |
| `preloadPromises` | 説明なし |
| `mediaQueries` | 説明なし |
| `fontMap` | 説明なし |
| `reverseMap` | 説明なし |
| `rtlLanguages` | 説明なし |
| `alpha` | 説明なし |

---

