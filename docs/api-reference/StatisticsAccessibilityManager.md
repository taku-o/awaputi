# StatisticsAccessibilityManager

## 概要

ファイル: `core/StatisticsAccessibilityManager.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [StatisticsAccessibilityManager](#statisticsaccessibilitymanager)
## 定数
- [indicators](#indicators)
- [altTextContainer](#alttextcontainer)
- [sections](#sections)
- [heading](#heading)
- [container](#container)
- [description](#description)
- [skipLinksContainer](#skiplinkscontainer)
- [skipLinks](#skiplinks)
- [skipLink](#skiplink)
- [selector](#selector)
- [priorityOrder](#priorityorder)
- [elements](#elements)
- [shortcuts](#shortcuts)
- [style](#style)
- [regions](#regions)
- [element](#element)
- [style](#style)
- [cues](#cues)
- [buffer](#buffer)
- [sampleRate](#samplerate)
- [buffer](#buffer)
- [data](#data)
- [handler](#handler)
- [direction](#direction)
- [currentIndex](#currentindex)
- [newIndex](#newindex)
- [element](#element)
- [label](#label)
- [element](#element)
- [index](#index)
- [element](#element)
- [summary](#summary)
- [updates](#updates)
- [description](#description)
- [generator](#generator)
- [text](#text)
- [altTextContainer](#alttextcontainer)
- [chartText](#charttext)
- [liveRegion](#liveregion)
- [utterance](#utterance)
- [buffer](#buffer)
- [source](#source)
- [gainNode](#gainnode)
- [parts](#parts)
- [currentElement](#currentelement)
- [details](#details)
- [label](#label)
- [description](#description)
- [role](#role)
- [descElement](#descelement)
- [helpText](#helptext)

---

## StatisticsAccessibilityManager

### コンストラクタ

```javascript
new StatisticsAccessibilityManager(statisticsManager, canvas, uiContainer)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `statisticsManager` | 説明なし |
| `canvas` | 説明なし |
| `uiContainer` | 説明なし |
| `config` | アクセシビリティ設定 |
| `state` | 状態管理 |
| `ariaElements` | ARIA要素管理 |
| `liveRegions` | 説明なし |
| `descriptions` | 説明なし |
| `focusableElements` | キーボードナビゲーション管理 |
| `currentFocusIndex` | 説明なし |
| `keyboardHandlers` | 説明なし |
| `textGenerators` | スクリーンリーダー用テキスト生成 |
| `focusableElements` | 説明なし |

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

#### detectScreenReader

**シグネチャ**:
```javascript
 detectScreenReader()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectScreenReader();

// detectScreenReaderの実用的な使用例
const result = instance.detectScreenReader(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.state.screenReaderActive)
```

**パラメーター**:
- `this.state.screenReaderActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.screenReaderActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupARIAStructure

**シグネチャ**:
```javascript
 setupARIAStructure()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupARIAStructure();

// setupARIAStructureの実用的な使用例
const result = instance.setupARIAStructure(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メインコンテナにroleを設定

**シグネチャ**:
```javascript
 if (this.uiContainer)
```

**パラメーター**:
- `this.uiContainer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.uiContainer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Canvasにアクセシブルな代替を提供

**シグネチャ**:
```javascript
 if (this.canvas)
```

**パラメーター**:
- `this.canvas`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.canvas);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createStatisticsARIAStructure

**シグネチャ**:
```javascript
 createStatisticsARIAStructure()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createStatisticsARIAStructure();

// createStatisticsARIAStructureの実用的な使用例
const result = instance.createStatisticsARIAStructure(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupKeyboardNavigation

**シグネチャ**:
```javascript
 setupKeyboardNavigation()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupKeyboardNavigation();

// setupKeyboardNavigationの実用的な使用例
const result = instance.setupKeyboardNavigation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createSkipLinks

**シグネチャ**:
```javascript
 createSkipLinks()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createSkipLinks();

// createSkipLinksの実用的な使用例
const result = instance.createSkipLinks(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateFocusableElements

**シグネチャ**:
```javascript
 updateFocusableElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateFocusableElements();

// updateFocusableElementsの実用的な使用例
const result = instance.updateFocusableElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

タブ順序の設定

**シグネチャ**:
```javascript
 if (this.config.keyboard.tabOrder)
```

**パラメーター**:
- `this.config.keyboard.tabOrder`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.keyboard.tabOrder);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setTabOrder

**シグネチャ**:
```javascript
 setTabOrder()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setTabOrder();

// setTabOrderの実用的な使用例
const result = instance.setTabOrder(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupKeyboardShortcuts

**シグネチャ**:
```javascript
 setupKeyboardShortcuts()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupKeyboardShortcuts();

// setupKeyboardShortcutsの実用的な使用例
const result = instance.setupKeyboardShortcuts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `indicators` | 説明なし |
| `altTextContainer` | 説明なし |
| `sections` | 説明なし |
| `heading` | 説明なし |
| `container` | 説明なし |
| `description` | 説明なし |
| `skipLinksContainer` | 説明なし |
| `skipLinks` | 説明なし |
| `skipLink` | 説明なし |
| `selector` | 説明なし |
| `priorityOrder` | 説明なし |
| `elements` | 説明なし |
| `shortcuts` | 説明なし |
| `style` | 説明なし |
| `regions` | 説明なし |
| `element` | 説明なし |
| `style` | 説明なし |
| `cues` | 説明なし |
| `buffer` | 説明なし |
| `sampleRate` | 説明なし |
| `buffer` | 説明なし |
| `data` | 説明なし |
| `handler` | 説明なし |
| `direction` | 説明なし |
| `currentIndex` | 説明なし |
| `newIndex` | 説明なし |
| `element` | 説明なし |
| `label` | 説明なし |
| `element` | 説明なし |
| `index` | 説明なし |
| `element` | 説明なし |
| `summary` | 説明なし |
| `updates` | 説明なし |
| `description` | 説明なし |
| `generator` | 説明なし |
| `text` | 説明なし |
| `altTextContainer` | 説明なし |
| `chartText` | 説明なし |
| `liveRegion` | 説明なし |
| `utterance` | 説明なし |
| `buffer` | 説明なし |
| `source` | 説明なし |
| `gainNode` | 説明なし |
| `parts` | 説明なし |
| `currentElement` | 説明なし |
| `details` | 説明なし |
| `label` | 説明なし |
| `description` | 説明なし |
| `role` | 説明なし |
| `descElement` | 説明なし |
| `helpText` | 説明なし |

---

