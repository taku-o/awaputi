# ErrorPanel

## 概要

ファイル: `debug/panels/ErrorPanel.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [ErrorPanel](#errorpanel)
## 定数
- [stored](#stored)
- [originalError](#originalerror)
- [originalWarn](#originalwarn)
- [originalLog](#originallog)
- [error](#error)
- [existing](#existing)
- [stats](#stats)
- [list](#list)
- [filter](#filter)
- [filteredErrors](#filterederrors)
- [div](#div)
- [patterns](#patterns)
- [messagePatterns](#messagepatterns)
- [key](#key)
- [topPatterns](#toppatterns)
- [data](#data)
- [blob](#blob)
- [url](#url)
- [a](#a)
- [div](#div)
- [element](#element)

---

## ErrorPanel

### コンストラクタ

```javascript
new ErrorPanel(gameEngine, debugInterface)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `gameEngine` | 説明なし |
| `debugInterface` | 説明なし |
| `element` | 説明なし |
| `errorReporter` | 説明なし |
| `errors` | 説明なし |
| `element` | 説明なし |
| `errors` | 説明なし |
| `errors` | 説明なし |
| `errors` | 説明なし |
| `element` | 説明なし |

### メソッド

#### create

**シグネチャ**:
```javascript
 create()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.create();

// createの実用的な使用例
const result = instance.create(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### bindEvents

**シグネチャ**:
```javascript
 bindEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.bindEvents();

// bindEventsの実用的な使用例
const result = instance.bindEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadErrors

**シグネチャ**:
```javascript
 loadErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadErrors();

// loadErrorsの実用的な使用例
const result = instance.loadErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stored)
```

**パラメーター**:
- `stored`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stored);

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

#### interceptConsoleErrors

**シグネチャ**:
```javascript
 interceptConsoleErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.interceptConsoleErrors();

// interceptConsoleErrorsの実用的な使用例
const result = instance.interceptConsoleErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addError

**シグネチャ**:
```javascript
 addError(level, message, context = {})
```

**パラメーター**:
- `level`
- `message`
- `context = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addError(level, message, context = {});

// addErrorの実用的な使用例
const result = instance.addError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existing)
```

**パラメーター**:
- `existing`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existing);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

最大100件に制限

**シグネチャ**:
```javascript
 if (this.errors.length > 100)
```

**パラメーター**:
- `this.errors.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.errors.length > 100);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveErrors

**シグネチャ**:
```javascript
 saveErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveErrors();

// saveErrorsの実用的な使用例
const result = instance.saveErrors(/* 適切なパラメータ */);
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

#### updateErrorDisplay

**シグネチャ**:
```javascript
 updateErrorDisplay()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateErrorDisplay();

// updateErrorDisplayの実用的な使用例
const result = instance.updateErrorDisplay(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateErrorStats

**シグネチャ**:
```javascript
 updateErrorStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateErrorStats();

// updateErrorStatsの実用的な使用例
const result = instance.updateErrorStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateErrorList

**シグネチャ**:
```javascript
 updateErrorList()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateErrorList();

// updateErrorListの実用的な使用例
const result = instance.updateErrorList(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateErrorPatterns

**シグネチャ**:
```javascript
 updateErrorPatterns()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateErrorPatterns();

// updateErrorPatternsの実用的な使用例
const result = instance.updateErrorPatterns(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (topPatterns.length > 0)
```

**パラメーター**:
- `topPatterns.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(topPatterns.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearErrors

**シグネチャ**:
```javascript
 clearErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearErrors();

// clearErrorsの実用的な使用例
const result = instance.clearErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportErrors

**シグネチャ**:
```javascript
 exportErrors()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportErrors();

// exportErrorsの実用的な使用例
const result = instance.exportErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filterErrors

**シグネチャ**:
```javascript
 filterErrors(filter)
```

**パラメーター**:
- `filter`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filterErrors(filter);

// filterErrorsの実用的な使用例
const result = instance.filterErrors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### escapeHtml

**シグネチャ**:
```javascript
 escapeHtml(text)
```

**パラメーター**:
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.escapeHtml(text);

// escapeHtmlの実用的な使用例
const result = instance.escapeHtml(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setElementText

**シグネチャ**:
```javascript
 setElementText(id, text)
```

**パラメーター**:
- `id`
- `text`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setElementText(id, text);

// setElementTextの実用的な使用例
const result = instance.setElementText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### show

**シグネチャ**:
```javascript
 show()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.show();

// showの実用的な使用例
const result = instance.show(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.element)
```

**パラメーター**:
- `this.element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hide

**シグネチャ**:
```javascript
 hide()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hide();

// hideの実用的な使用例
const result = instance.hide(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.element)
```

**パラメーター**:
- `this.element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.element);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSize

**シグネチャ**:
```javascript
 updateSize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSize();

// updateSizeの実用的な使用例
const result = instance.updateSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パネルサイズ変更時の処理

**シグネチャ**:
```javascript
 if (this.element)
```

**パラメーター**:
- `this.element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.element);

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

**シグネチャ**:
```javascript
 if (this.element && this.element.parentNode)
```

**パラメーター**:
- `this.element && this.element.parentNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.element && this.element.parentNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `stored` | 説明なし |
| `originalError` | 説明なし |
| `originalWarn` | 説明なし |
| `originalLog` | 説明なし |
| `error` | 説明なし |
| `existing` | 説明なし |
| `stats` | 説明なし |
| `list` | 説明なし |
| `filter` | 説明なし |
| `filteredErrors` | 説明なし |
| `div` | 説明なし |
| `patterns` | 説明なし |
| `messagePatterns` | 説明なし |
| `key` | 説明なし |
| `topPatterns` | 説明なし |
| `data` | 説明なし |
| `blob` | 説明なし |
| `url` | 説明なし |
| `a` | 説明なし |
| `div` | 説明なし |
| `element` | 説明なし |

---

