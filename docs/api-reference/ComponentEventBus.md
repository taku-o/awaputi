# ComponentEventBus

## 概要

ファイル: `scenes/components/ComponentEventBus.js`  
最終更新: 2025/7/29 14:46:52

## 目次

## クラス
- [ComponentEventBus](#componenteventbus)
## 定数
- [listenerInfo](#listenerinfo)
- [listeners](#listeners)
- [index](#index)
- [listeners](#listeners)
- [toRemove](#toremove)
- [result](#result)
- [errorInfo](#errorinfo)
- [errorInfo](#errorinfo)

---

## ComponentEventBus

### コンストラクタ

```javascript
new ComponentEventBus()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `listeners` | イベントリスナーの管理 |
| `eventHistory` | デバッグ用のイベント履歴 |
| `maxHistorySize` | 説明なし |
| `errorHandlers` | エラーハンドリング |
| `eventHistory` | 説明なし |
| `errorHandlers` | 説明なし |

### メソッド

#### on

**シグネチャ**:
```javascript
 on(event, callback, options = {})
```

**パラメーター**:
- `event`
- `callback`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.on(event, callback, options = {});

// onの実用的な使用例
const result = instance.on(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof event !== 'string' || typeof callback !== 'function')
```

**パラメーター**:
- `typeof event !== 'string' || typeof callback !== 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof event !== 'string' || typeof callback !== 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### once

**シグネチャ**:
```javascript
 once(event, callback)
```

**パラメーター**:
- `event`
- `callback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.once(event, callback);

// onceの実用的な使用例
const result = instance.once(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### off

**シグネチャ**:
```javascript
 off(event, callbackOrId)
```

**パラメーター**:
- `event`
- `callbackOrId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.off(event, callbackOrId);

// offの実用的な使用例
const result = instance.off(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index !== -1)
```

**パラメーター**:
- `index !== -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index !== -1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

リスナーが空になった場合はイベント自体を削除

**シグネチャ**:
```javascript
 if (listeners.length === 0)
```

**パラメーター**:
- `listeners.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(listeners.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### emit

**シグネチャ**:
```javascript
 emit(event, data)
```

**パラメーター**:
- `event`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.emit(event, data);

// emitの実用的な使用例
const result = instance.emit(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const listener of listeners)
```

**パラメーター**:
- `const listener of listeners`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const listener of listeners);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result === true)
```

**パラメーター**:
- `result === true`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result === true);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

onceリスナーの場合は削除対象にマーク

**シグネチャ**:
```javascript
 if (listener.once)
```

**パラメーター**:
- `listener.once`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(listener.once);

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

#### for

onceリスナーを削除

**シグネチャ**:
```javascript
 for (const id of toRemove)
```

**パラメーター**:
- `const id of toRemove`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const id of toRemove);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### removeAllListeners

**シグネチャ**:
```javascript
 removeAllListeners(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeAllListeners(event);

// removeAllListenersの実用的な使用例
const result = instance.removeAllListeners(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEventNames

**シグネチャ**:
```javascript
 getEventNames()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEventNames();

// getEventNamesの実用的な使用例
const result = instance.getEventNames(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getListenerCount

**シグネチャ**:
```javascript
 getListenerCount(event)
```

**パラメーター**:
- `event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getListenerCount(event);

// getListenerCountの実用的な使用例
const result = instance.getListenerCount(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### onError

**シグネチャ**:
```javascript
 onError(handler)
```

**パラメーター**:
- `handler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.onError(handler);

// onErrorの実用的な使用例
const result = instance.onError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof handler === 'function')
```

**パラメーター**:
- `typeof handler === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof handler === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDebugInfo

**シグネチャ**:
```javascript
 getDebugInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDebugInfo();

// getDebugInfoの実用的な使用例
const result = instance.getDebugInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateListenerId

**シグネチャ**:
```javascript
 generateListenerId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateListenerId();

// generateListenerIdの実用的な使用例
const result = instance.generateListenerId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### addToHistory

**シグネチャ**:
```javascript
 addToHistory(event, data)
```

**パラメーター**:
- `event`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addToHistory(event, data);

// addToHistoryの実用的な使用例
const result = instance.addToHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴サイズを制限

**シグネチャ**:
```javascript
 if (this.eventHistory.length > this.maxHistorySize)
```

**パラメーター**:
- `this.eventHistory.length > this.maxHistorySize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.eventHistory.length > this.maxHistorySize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleListenerError

**シグネチャ**:
```javascript
 handleListenerError(error, event, listener)
```

**パラメーター**:
- `error`
- `event`
- `listener`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleListenerError(error, event, listener);

// handleListenerErrorの実用的な使用例
const result = instance.handleListenerError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

エラーハンドラーに通知

**シグネチャ**:
```javascript
 for (const handler of this.errorHandlers)
```

**パラメーター**:
- `const handler of this.errorHandlers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const handler of this.errorHandlers);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (handlerError)
```

**パラメーター**:
- `handlerError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(handlerError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleEmitError

**シグネチャ**:
```javascript
 handleEmitError(error, event, data)
```

**パラメーター**:
- `error`
- `event`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleEmitError(error, event, data);

// handleEmitErrorの実用的な使用例
const result = instance.handleEmitError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

エラーハンドラーに通知

**シグネチャ**:
```javascript
 for (const handler of this.errorHandlers)
```

**パラメーター**:
- `const handler of this.errorHandlers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const handler of this.errorHandlers);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (handlerError)
```

**パラメーター**:
- `handlerError`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(handlerError);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### safeClone

**シグネチャ**:
```javascript
 safeClone(obj)
```

**パラメーター**:
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.safeClone(obj);

// safeCloneの実用的な使用例
const result = instance.safeClone(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (obj === null || typeof obj !== 'object')
```

**パラメーター**:
- `obj === null || typeof obj !== 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(obj === null || typeof obj !== 'object');

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
| `listenerInfo` | 説明なし |
| `listeners` | 説明なし |
| `index` | 説明なし |
| `listeners` | 説明なし |
| `toRemove` | 説明なし |
| `result` | 説明なし |
| `errorInfo` | 説明なし |
| `errorInfo` | 説明なし |

---

