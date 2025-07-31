# StatisticsFilterUI

## 概要

ファイル: `scenes/components/StatisticsFilterUI.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [StatisticsFilterUI](#statisticsfilterui)
## 定数
- [filterHeight](#filterheight)
- [buttonWidth](#buttonwidth)
- [buttonHeight](#buttonheight)
- [isActive](#isactive)
- [modeHeight](#modeheight)
- [buttonWidth](#buttonwidth)
- [buttonHeight](#buttonheight)
- [isActive](#isactive)

---

## StatisticsFilterUI

### コンストラクタ

```javascript
new StatisticsFilterUI(gameEngine, eventBus, state)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `eventBus` | 説明なし |
| `state` | 説明なし |
| `errorHandler` | エラーハンドリング |
| `currentPeriodFilter` | フィルター設定 |
| `currentViewMode` | 説明なし |
| `accessibilitySettings` | アクセシビリティ設定 |
| `filterHeight` | レイアウト設定 |
| `modeHeight` | 説明なし |
| `buttonSpacing` | 説明なし |
| `contentPadding` | 説明なし |
| `periodButtons` | ボタン位置情報（クリック判定用） |
| `modeButtons` | 説明なし |
| `periods` | 期間フィルターオプション |
| `modes` | 表示モードオプション |
| `periodButtons` | クリック判定用配列をリセット |
| `currentPeriodFilter` | 説明なし |
| `modeButtons` | クリック判定用配列をリセット |
| `currentViewMode` | 説明なし |
| `currentPeriodFilter` | 説明なし |
| `currentViewMode` | 説明なし |
| `currentPeriodFilter` | 説明なし |
| `currentViewMode` | 説明なし |
| `periodButtons` | 説明なし |
| `modeButtons` | 説明なし |

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

#### render

**シグネチャ**:
```javascript
 render(context, x, y, width)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.render(context, x, y, width);

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

#### renderPeriodFilter

**シグネチャ**:
```javascript
 renderPeriodFilter(context, x, y, width)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderPeriodFilter(context, x, y, width);

// renderPeriodFilterの実用的な使用例
const result = instance.renderPeriodFilter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボタン背景

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

#### if

ボタン枠線

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

#### if

ボタンテキスト

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

#### renderViewModeSelector

**シグネチャ**:
```javascript
 renderViewModeSelector(context, x, y, width)
```

**パラメーター**:
- `context`
- `x`
- `y`
- `width`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.renderViewModeSelector(context, x, y, width);

// renderViewModeSelectorの実用的な使用例
const result = instance.renderViewModeSelector(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ボタン背景

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

#### if

ボタン枠線

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

#### if

ボタンテキスト

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

#### for

期間フィルターボタンのクリック判定

**シグネチャ**:
```javascript
 for (const button of this.periodButtons)
```

**パラメーター**:
- `const button of this.periodButtons`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const button of this.periodButtons);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height)
```

**パラメーター**:
- `x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

表示モードボタンのクリック判定

**シグネチャ**:
```javascript
 for (const button of this.modeButtons)
```

**パラメーター**:
- `const button of this.modeButtons`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const button of this.modeButtons);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height)
```

**パラメーター**:
- `x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height);

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

#### getCurrentPeriodFilter

**シグネチャ**:
```javascript
 getCurrentPeriodFilter()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentPeriodFilter();

// getCurrentPeriodFilterの実用的な使用例
const result = instance.getCurrentPeriodFilter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentViewMode

**シグネチャ**:
```javascript
 getCurrentViewMode()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentViewMode();

// getCurrentViewModeの実用的な使用例
const result = instance.getCurrentViewMode(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### reset

**シグネチャ**:
```javascript
 reset()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.reset();

// resetの実用的な使用例
const result = instance.reset(/* 適切なパラメータ */);
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
| `filterHeight` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonHeight` | 説明なし |
| `isActive` | 説明なし |
| `modeHeight` | 説明なし |
| `buttonWidth` | 説明なし |
| `buttonHeight` | 説明なし |
| `isActive` | 説明なし |

---

