# TextScalingManager

## 概要

ファイル: `core/TextScalingManager.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [TextScalingManager](#textscalingmanager)
## 定数
- [testElement](#testelement)
- [computedStyle](#computedstyle)
- [systemFontSize](#systemfontsize)
- [devicePixelRatio](#devicepixelratio)
- [saved](#saved)
- [preferences](#preferences)
- [root](#root)
- [entry](#entry)
- [newBreakpoint](#newbreakpoint)
- [root](#root)
- [elements](#elements)
- [styles](#styles)
- [tagName](#tagname)
- [text](#text)
- [gameSelectors](#gameselectors)
- [styles](#styles)
- [display](#display)
- [styles](#styles)
- [originalStyle](#originalstyle)
- [elementData](#elementdata)
- [startTime](#starttime)
- [originalStyle](#originalstyle)
- [endTime](#endtime)
- [styles](#styles)
- [styles](#styles)
- [fontFamily](#fontfamily)
- [currentTotal](#currenttotal)
- [currentAverage](#currentaverage)
- [operationCount](#operationcount)
- [newScale](#newscale)
- [newScale](#newscale)
- [oldScale](#oldscale)
- [root](#root)
- [newLineHeight](#newlineheight)
- [root](#root)
- [maxAdjustment](#maxadjustment)
- [normalizedAdjustment](#normalizedadjustment)
- [root](#root)
- [maxAdjustment](#maxadjustment)
- [normalizedAdjustment](#normalizedadjustment)
- [root](#root)
- [sessionDuration](#sessionduration)

---

## TextScalingManager

### コンストラクタ

```javascript
new TextScalingManager(visualAccessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `visualAccessibilityManager` | 説明なし |
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | スケーリング設定 |
| `scaledElements` | スケーリング要素の管理 |
| `originalStyles` | 説明なし |
| `layoutContainers` | 説明なし |
| `gameElements` | 説明なし |
| `dynamicStyleSheet` | CSS変数とスタイル |
| `cssVariables` | 説明なし |
| `currentBreakpoint` | レスポンシブ管理 |
| `viewportObserver` | 説明なし |
| `stats` | 統計情報 |
| `userPreferences` | ユーザー設定 |
| `scalingQueue` | パフォーマンス最適化 |
| `isProcessing` | 説明なし |
| `throttleDelay` | 説明なし |
| `dynamicStyleSheet` | 説明なし |
| `viewportObserver` | ResizeObserverでビューポート変更を監視 |
| `currentBreakpoint` | 説明なし |
| `domObserver` | 説明なし |

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

#### detectSystemPreferences

**シグネチャ**:
```javascript
 detectSystemPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectSystemPreferences();

// detectSystemPreferencesの実用的な使用例
const result = instance.detectSystemPreferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

16px未満を小さいフォント、18px以上を大きいフォントと判定

**シグネチャ**:
```javascript
 if (systemFontSize >= 18)
```

**パラメーター**:
- `systemFontSize >= 18`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(systemFontSize >= 18);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (systemFontSize < 14)
```

**パラメーター**:
- `systemFontSize < 14`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(systemFontSize < 14);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (devicePixelRatio > 2)
```

**パラメーター**:
- `devicePixelRatio > 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(devicePixelRatio > 2);

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

#### loadUserPreferences

**シグネチャ**:
```javascript
 loadUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadUserPreferences();

// loadUserPreferencesの実用的な使用例
const result = instance.loadUserPreferences(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (saved)
```

**パラメーター**:
- `saved`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(saved);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.scale !== 1.0)
```

**パラメーター**:
- `this.config.scale !== 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scale !== 1.0);

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

#### saveUserPreferences

**シグネチャ**:
```javascript
 saveUserPreferences()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveUserPreferences();

// saveUserPreferencesの実用的な使用例
const result = instance.saveUserPreferences(/* 適切なパラメータ */);
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

#### createDynamicStyleSheet

**シグネチャ**:
```javascript
 createDynamicStyleSheet()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createDynamicStyleSheet();

// createDynamicStyleSheetの実用的な使用例
const result = instance.createDynamicStyleSheet(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### media

**シグネチャ**:
```javascript
 media (max-width: 768px)
```

**パラメーター**:
- `max-width: 768px`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.media(max-width: 768px);

// mediaの実用的な使用例
const result = instance.media(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### media

**シグネチャ**:
```javascript
 media (max-width: 480px)
```

**パラメーター**:
- `max-width: 480px`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.media(max-width: 480px);

// mediaの実用的な使用例
const result = instance.media(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeCSSVariables

**シグネチャ**:
```javascript
 initializeCSSVariables()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeCSSVariables();

// initializeCSSVariablesの実用的な使用例
const result = instance.initializeCSSVariables(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

CSS変数を適用

**シグネチャ**:
```javascript
 for (const [variable, value] of this.cssVariables)
```

**パラメーター**:
- `const [variable`
- `value] of this.cssVariables`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [variable, value] of this.cssVariables);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupResponsiveObserver

**シグネチャ**:
```javascript
 setupResponsiveObserver()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupResponsiveObserver();

// setupResponsiveObserverの実用的な使用例
const result = instance.setupResponsiveObserver(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newBreakpoint !== this.currentBreakpoint)
```

**パラメーター**:
- `newBreakpoint !== this.currentBreakpoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newBreakpoint !== this.currentBreakpoint);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBreakpoint

**シグネチャ**:
```javascript
 getBreakpoint(width)
```

**パラメーター**:
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBreakpoint(width);

// getBreakpointの実用的な使用例
const result = instance.getBreakpoint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (width < this.config.responsiveBreakpoints.mobile)
```

**パラメーター**:
- `width < this.config.responsiveBreakpoints.mobile`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(width < this.config.responsiveBreakpoints.mobile);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (width < this.config.responsiveBreakpoints.tablet)
```

**パラメーター**:
- `width < this.config.responsiveBreakpoints.tablet`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(width < this.config.responsiveBreakpoints.tablet);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleBreakpointChange

**シグネチャ**:
```javascript
 handleBreakpointChange(breakpoint)
```

**パラメーター**:
- `breakpoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleBreakpointChange(breakpoint);

// handleBreakpointChangeの実用的な使用例
const result = instance.handleBreakpointChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.enabled && this.userPreferences.responsiveScaling)
```

**パラメーター**:
- `this.config.enabled && this.userPreferences.responsiveScaling`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled && this.userPreferences.responsiveScaling);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustForBreakpoint

**シグネチャ**:
```javascript
 adjustForBreakpoint(breakpoint)
```

**パラメーター**:
- `breakpoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustForBreakpoint(breakpoint);

// adjustForBreakpointの実用的な使用例
const result = instance.adjustForBreakpoint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (breakpoint)
```

**パラメーター**:
- `breakpoint`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(breakpoint);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (event.ctrlKey || event.metaKey)
```

**パラメーター**:
- `event.ctrlKey || event.metaKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.ctrlKey || event.metaKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (event.key)
```

**パラメーター**:
- `event.key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(event.key);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

フォントロードイベント

**シグネチャ**:
```javascript
 if (document.fonts)
```

**パラメーター**:
- `document.fonts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.fonts);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### observeDOM

**シグネチャ**:
```javascript
 observeDOM()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.observeDOM();

// observeDOMの実用的な使用例
const result = instance.observeDOM(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (mutation.type === 'childList')
```

**パラメーター**:
- `mutation.type === 'childList'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mutation.type === 'childList');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (node.nodeType === Node.ELEMENT_NODE)
```

**パラメーター**:
- `node.nodeType === Node.ELEMENT_NODE`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(node.nodeType === Node.ELEMENT_NODE);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeInitialElements

**シグネチャ**:
```javascript
 analyzeInitialElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeInitialElements();

// analyzeInitialElementsの実用的な使用例
const result = instance.analyzeInitialElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### categorizeElement

**シグネチャ**:
```javascript
 categorizeElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.categorizeElement(element);

// categorizeElementの実用的な使用例
const result = instance.categorizeElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hasTextContent

**シグネチャ**:
```javascript
 hasTextContent(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hasTextContent(element);

// hasTextContentの実用的な使用例
const result = instance.hasTextContent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isGameElement

**シグネチャ**:
```javascript
 isGameElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isGameElement(element);

// isGameElementの実用的な使用例
const result = instance.isGameElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isLayoutContainer

**シグネチャ**:
```javascript
 isLayoutContainer(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isLayoutContainer(element);

// isLayoutContainerの実用的な使用例
const result = instance.isLayoutContainer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerScalableElement

**シグネチャ**:
```javascript
 registerScalableElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerScalableElement(element);

// registerScalableElementの実用的な使用例
const result = instance.registerScalableElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### processNewElement

**シグネチャ**:
```javascript
 processNewElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processNewElement(element);

// processNewElementの実用的な使用例
const result = instance.processNewElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.enabled)
```

**パラメーター**:
- `this.config.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyScalingToElement

**シグネチャ**:
```javascript
 applyScalingToElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyScalingToElement(element);

// applyScalingToElementの実用的な使用例
const result = instance.applyScalingToElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!elementData || elementData.isScaled)
```

**パラメーター**:
- `!elementData || elementData.isScaled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!elementData || elementData.isScaled);

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

#### shouldPreserveLayout

**シグネチャ**:
```javascript
 shouldPreserveLayout(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.shouldPreserveLayout(element);

// shouldPreserveLayoutの実用的な使用例
const result = instance.shouldPreserveLayout(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (parent)
```

**パラメーター**:
- `parent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(parent);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (styles.width !== 'auto' && styles.height !== 'auto')
```

**パラメーター**:
- `styles.width !== 'auto' && styles.height !== 'auto'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(styles.width !== 'auto' && styles.height !== 'auto');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyLayoutPreservation

**シグネチャ**:
```javascript
 applyLayoutPreservation(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyLayoutPreservation(element);

// applyLayoutPreservationの実用的な使用例
const result = instance.applyLayoutPreservation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

複数行の場合は行数制限を設定

**シグネチャ**:
```javascript
 if (styles.whiteSpace === 'normal' || styles.whiteSpace === 'pre-wrap')
```

**パラメーター**:
- `styles.whiteSpace === 'normal' || styles.whiteSpace === 'pre-wrap'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(styles.whiteSpace === 'normal' || styles.whiteSpace === 'pre-wrap');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyFontFamily

**シグネチャ**:
```javascript
 applyFontFamily(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyFontFamily(element);

// applyFontFamilyの実用的な使用例
const result = instance.applyFontFamily(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (fontFamily)
```

**パラメーター**:
- `fontFamily`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(fontFamily);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updatePerformanceStats

**シグネチャ**:
```javascript
 updatePerformanceStats(operationTime)
```

**パラメーター**:
- `operationTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updatePerformanceStats(operationTime);

// updatePerformanceStatsの実用的な使用例
const result = instance.updatePerformanceStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recalculateAllElements

**シグネチャ**:
```javascript
 recalculateAllElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recalculateAllElements();

// recalculateAllElementsの実用的な使用例
const result = instance.recalculateAllElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [element, elementData] of this.scaledElements)
```

**パラメーター**:
- `const [element`
- `elementData] of this.scaledElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [element, elementData] of this.scaledElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (elementData.isScaled)
```

**パラメーター**:
- `elementData.isScaled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(elementData.isScaled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### increaseScale

**シグネチャ**:
```javascript
 increaseScale()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.increaseScale();

// increaseScaleの実用的な使用例
const result = instance.increaseScale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### decreaseScale

**シグネチャ**:
```javascript
 decreaseScale()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.decreaseScale();

// decreaseScaleの実用的な使用例
const result = instance.decreaseScale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetScale

**シグネチャ**:
```javascript
 resetScale()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetScale();

// resetScaleの実用的な使用例
const result = instance.resetScale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setScale

**シグネチャ**:
```javascript
 setScale(scale)
```

**パラメーター**:
- `scale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setScale(scale);

// setScaleの実用的な使用例
const result = instance.setScale(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (scale < this.config.minScale || scale > this.config.maxScale)
```

**パラメーター**:
- `scale < this.config.minScale || scale > this.config.maxScale`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scale < this.config.minScale || scale > this.config.maxScale);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スケーリング有効/無効の切り替え

**シグネチャ**:
```javascript
 if (scale === 1.0)
```

**パラメーター**:
- `scale === 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(scale === 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setFontFamily

**シグネチャ**:
```javascript
 setFontFamily(fontFamily)
```

**パラメーター**:
- `fontFamily`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setFontFamily(fontFamily);

// setFontFamilyの実用的な使用例
const result = instance.setFontFamily(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.config.fontFamilies[fontFamily])
```

**パラメーター**:
- `!this.config.fontFamilies[fontFamily]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.config.fontFamilies[fontFamily]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustLineHeight

**シグネチャ**:
```javascript
 adjustLineHeight(adjustment)
```

**パラメーター**:
- `adjustment`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustLineHeight(adjustment);

// adjustLineHeightの実用的な使用例
const result = instance.adjustLineHeight(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustLetterSpacing

**シグネチャ**:
```javascript
 adjustLetterSpacing(adjustment)
```

**パラメーター**:
- `adjustment`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustLetterSpacing(adjustment);

// adjustLetterSpacingの実用的な使用例
const result = instance.adjustLetterSpacing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### adjustWordSpacing

**シグネチャ**:
```javascript
 adjustWordSpacing(adjustment)
```

**パラメーター**:
- `adjustment`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.adjustWordSpacing(adjustment);

// adjustWordSpacingの実用的な使用例
const result = instance.adjustWordSpacing(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleSmoothTransitions

**シグネチャ**:
```javascript
 toggleSmoothTransitions(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleSmoothTransitions(enabled);

// toggleSmoothTransitionsの実用的な使用例
const result = instance.toggleSmoothTransitions(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enable

**シグネチャ**:
```javascript
 enable()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enable();

// enableの実用的な使用例
const result = instance.enable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.userPreferences.smoothTransitions)
```

**パラメーター**:
- `this.userPreferences.smoothTransitions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.userPreferences.smoothTransitions);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### disable

**シグネチャ**:
```javascript
 disable()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.disable();

// disableの実用的な使用例
const result = instance.disable(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

全要素からスケーリングを削除

**シグネチャ**:
```javascript
 for (const [element, elementData] of this.scaledElements)
```

**パラメーター**:
- `const [element`
- `elementData] of this.scaledElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [element, elementData] of this.scaledElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentSettings

**シグネチャ**:
```javascript
 getCurrentSettings()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentSettings();

// getCurrentSettingsの実用的な使用例
const result = instance.getCurrentSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyConfig

**シグネチャ**:
```javascript
 applyConfig(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyConfig(config);

// applyConfigの実用的な使用例
const result = instance.applyConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.visual?.textScaling)
```

**パラメーター**:
- `config.visual?.textScaling`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.visual?.textScaling);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateReport

**シグネチャ**:
```javascript
 generateReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateReport();

// generateReportの実用的な使用例
const result = instance.generateReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setEnabled

**シグネチャ**:
```javascript
 setEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEnabled(enabled);

// setEnabledの実用的な使用例
const result = instance.setEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.config.scale === 1.0)
```

**パラメーター**:
- `this.config.scale === 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.scale === 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

オブザーバーの停止

**シグネチャ**:
```javascript
 if (this.domObserver)
```

**パラメーター**:
- `this.domObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.domObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.viewportObserver)
```

**パラメーター**:
- `this.viewportObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.viewportObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スタイルシートの削除

**シグネチャ**:
```javascript
 if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode)
```

**パラメーター**:
- `this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `testElement` | 説明なし |
| `computedStyle` | 説明なし |
| `systemFontSize` | 説明なし |
| `devicePixelRatio` | 説明なし |
| `saved` | 説明なし |
| `preferences` | 説明なし |
| `root` | 説明なし |
| `entry` | 説明なし |
| `newBreakpoint` | 説明なし |
| `root` | 説明なし |
| `elements` | 説明なし |
| `styles` | 説明なし |
| `tagName` | 説明なし |
| `text` | 説明なし |
| `gameSelectors` | 説明なし |
| `styles` | 説明なし |
| `display` | 説明なし |
| `styles` | 説明なし |
| `originalStyle` | 説明なし |
| `elementData` | 説明なし |
| `startTime` | 説明なし |
| `originalStyle` | 説明なし |
| `endTime` | 説明なし |
| `styles` | 説明なし |
| `styles` | 説明なし |
| `fontFamily` | 説明なし |
| `currentTotal` | 説明なし |
| `currentAverage` | 説明なし |
| `operationCount` | 説明なし |
| `newScale` | 説明なし |
| `newScale` | 説明なし |
| `oldScale` | 説明なし |
| `root` | 説明なし |
| `newLineHeight` | 説明なし |
| `root` | 説明なし |
| `maxAdjustment` | 説明なし |
| `normalizedAdjustment` | 説明なし |
| `root` | 説明なし |
| `maxAdjustment` | 説明なし |
| `normalizedAdjustment` | 説明なし |
| `root` | 説明なし |
| `sessionDuration` | 説明なし |

---

