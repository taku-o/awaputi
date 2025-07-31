# OfflineManager

## 概要

ファイル: `core/OfflineManager.js`  
最終更新: 2025/7/29 10:26:52

## 目次

## クラス
- [OfflineManager](#offlinemanager)
## 定数
- [previousState](#previousstate)
- [offlineOperation](#offlineoperation)
- [processedOperations](#processedoperations)
- [failedOperations](#failedoperations)
- [startTime](#starttime)
- [response](#response)
- [endTime](#endtime)
- [responseTime](#responsetime)
- [stateData](#statedata)
- [stateData](#statedata)
- [now](#now)
- [oldHeartbeatInterval](#oldheartbeatinterval)
- [listeners](#listeners)
- [listeners](#listeners)
- [index](#index)

---

## OfflineManager

### コンストラクタ

```javascript
new OfflineManager(dataStorage, syncManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `dataStorage` | 説明なし |
| `syncManager` | 説明なし |
| `config` | 説明なし |
| `state` | 説明なし |
| `heartbeatTimer` | 説明なし |
| `reconnectTimer` | 説明なし |
| `eventListeners` | 説明なし |
| `heartbeatTimer` | 説明なし |
| `heartbeatTimer` | 説明なし |
| `config` | 説明なし |
| `reconnectTimer` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize()
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

#### handleOnlineStateChange

**シグネチャ**:
```javascript
async handleOnlineStateChange(isOnline)
```

**パラメーター**:
- `isOnline`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOnlineStateChange(isOnline);

// handleOnlineStateChangeの実用的な使用例
const result = instance.handleOnlineStateChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isOnline && !previousState)
```

**パラメーター**:
- `isOnline && !previousState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isOnline && !previousState);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!isOnline && previousState)
```

**パラメーター**:
- `!isOnline && previousState`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!isOnline && previousState);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### handleOnlineRecovery

**シグネチャ**:
```javascript
async handleOnlineRecovery()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOnlineRecovery();

// handleOnlineRecoveryの実用的な使用例
const result = instance.handleOnlineRecovery(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動同期の実行（設定されている場合）

**シグネチャ**:
```javascript
 if (this.config.autoSyncOnReconnect && this.syncManager)
```

**パラメーター**:
- `this.config.autoSyncOnReconnect && this.syncManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.autoSyncOnReconnect && this.syncManager);

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

#### handleOfflineTransition

**シグネチャ**:
```javascript
async handleOfflineTransition()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.handleOfflineTransition();

// handleOfflineTransitionの実用的な使用例
const result = instance.handleOfflineTransition(/* 適切なパラメータ */);
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

#### recordOfflineOperation

**シグネチャ**:
```javascript
async recordOfflineOperation(operation)
```

**パラメーター**:
- `operation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordOfflineOperation(operation);

// recordOfflineOperationの実用的な使用例
const result = instance.recordOfflineOperation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.config.enableOfflineMode)
```

**パラメーター**:
- `!this.config.enableOfflineMode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.config.enableOfflineMode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

操作キューの容量チェック

**シグネチャ**:
```javascript
 if (this.state.offlineOperations.length >= this.config.maxOfflineOperations)
```

**パラメーター**:
- `this.state.offlineOperations.length >= this.config.maxOfflineOperations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.offlineOperations.length >= this.config.maxOfflineOperations);

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

#### processOfflineOperations

**シグネチャ**:
```javascript
async processOfflineOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processOfflineOperations();

// processOfflineOperationsの実用的な使用例
const result = instance.processOfflineOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.state.offlineOperations.length === 0)
```

**パラメーター**:
- `this.state.offlineOperations.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.offlineOperations.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const operation of this.state.offlineOperations)
```

**パラメーター**:
- `const operation of this.state.offlineOperations`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const operation of this.state.offlineOperations);

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

#### if

**シグネチャ**:
```javascript
 if (operation.retries >= 3)
```

**パラメーター**:
- `operation.retries >= 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(operation.retries >= 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### executeOfflineOperation

**シグネチャ**:
```javascript
async executeOfflineOperation(operation)
```

**パラメーター**:
- `operation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeOfflineOperation(operation);

// executeOfflineOperationの実用的な使用例
const result = instance.executeOfflineOperation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (operation.type)
```

**パラメーター**:
- `operation.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(operation.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.syncManager && this.syncManager.cloudStorage)
```

**パラメーター**:
- `this.syncManager && this.syncManager.cloudStorage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.syncManager && this.syncManager.cloudStorage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.syncManager && this.syncManager.cloudStorage)
```

**パラメーター**:
- `this.syncManager && this.syncManager.cloudStorage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.syncManager && this.syncManager.cloudStorage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkConnectionQuality

**シグネチャ**:
```javascript
async checkConnectionQuality()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkConnectionQuality();

// checkConnectionQualityの実用的な使用例
const result = instance.checkConnectionQuality(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!navigator.onLine)
```

**パラメーター**:
- `!navigator.onLine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!navigator.onLine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (responseTime < 200)
```

**パラメーター**:
- `responseTime < 200`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(responseTime < 200);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (responseTime < 1000)
```

**パラメーター**:
- `responseTime < 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(responseTime < 1000);

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

#### if

**シグネチャ**:
```javascript
 if (this.state.heartbeatFailures >= this.config.maxHeartbeatRetries)
```

**パラメーター**:
- `this.state.heartbeatFailures >= this.config.maxHeartbeatRetries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.state.heartbeatFailures >= this.config.maxHeartbeatRetries);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

navigator.onLineが間違っている場合の対処

**シグネチャ**:
```javascript
 if (navigator.onLine)
```

**パラメーター**:
- `navigator.onLine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(navigator.onLine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startHeartbeat

**シグネチャ**:
```javascript
 startHeartbeat()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startHeartbeat();

// startHeartbeatの実用的な使用例
const result = instance.startHeartbeat(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.heartbeatTimer)
```

**パラメーター**:
- `this.heartbeatTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.heartbeatTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopHeartbeat

**シグネチャ**:
```javascript
 stopHeartbeat()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopHeartbeat();

// stopHeartbeatの実用的な使用例
const result = instance.stopHeartbeat(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.heartbeatTimer)
```

**パラメーター**:
- `this.heartbeatTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.heartbeatTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveOfflineState

**シグネチャ**:
```javascript
async saveOfflineState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveOfflineState();

// saveOfflineStateの実用的な使用例
const result = instance.saveOfflineState(/* 適切なパラメータ */);
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

#### restoreOfflineState

**シグネチャ**:
```javascript
async restoreOfflineState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.restoreOfflineState();

// restoreOfflineStateの実用的な使用例
const result = instance.restoreOfflineState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stateData)
```

**パラメーター**:
- `stateData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stateData);

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

#### getOfflineStatus

**シグネチャ**:
```javascript
 getOfflineStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getOfflineStatus();

// getOfflineStatusの実用的な使用例
const result = instance.getOfflineStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateConfig

**シグネチャ**:
```javascript
 updateConfig(newConfig)
```

**パラメーター**:
- `newConfig`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateConfig(newConfig);

// updateConfigの実用的な使用例
const result = instance.updateConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ハートビート間隔が変更された場合は再起動

**シグネチャ**:
```javascript
 if (newConfig.heartbeatInterval && newConfig.heartbeatInterval !== oldHeartbeatInterval)
```

**パラメーター**:
- `newConfig.heartbeatInterval && newConfig.heartbeatInterval !== oldHeartbeatInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newConfig.heartbeatInterval && newConfig.heartbeatInterval !== oldHeartbeatInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearOfflineOperations

**シグネチャ**:
```javascript
 clearOfflineOperations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearOfflineOperations();

// clearOfflineOperationsの実用的な使用例
const result = instance.clearOfflineOperations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### emitEvent

**シグネチャ**:
```javascript
 emitEvent(eventName, data = null)
```

**パラメーター**:
- `eventName`
- `data = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.emitEvent(eventName, data = null);

// emitEventの実用的な使用例
const result = instance.emitEvent(/* 適切なパラメータ */);
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

#### on

**シグネチャ**:
```javascript
 on(eventName, listener)
```

**パラメーター**:
- `eventName`
- `listener`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.on(eventName, listener);

// onの実用的な使用例
const result = instance.on(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### off

**シグネチャ**:
```javascript
 off(eventName, listener)
```

**パラメーター**:
- `eventName`
- `listener`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.off(eventName, listener);

// offの実用的な使用例
const result = instance.off(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (index > -1)
```

**パラメーター**:
- `index > -1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index > -1);

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

再接続タイマーの停止

**シグネチャ**:
```javascript
 if (this.reconnectTimer)
```

**パラメーター**:
- `this.reconnectTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.reconnectTimer);

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


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `previousState` | 説明なし |
| `offlineOperation` | 説明なし |
| `processedOperations` | 説明なし |
| `failedOperations` | 説明なし |
| `startTime` | 説明なし |
| `response` | 説明なし |
| `endTime` | 説明なし |
| `responseTime` | 説明なし |
| `stateData` | 説明なし |
| `stateData` | 説明なし |
| `now` | 説明なし |
| `oldHeartbeatInterval` | 説明なし |
| `listeners` | 説明なし |
| `listeners` | 説明なし |
| `index` | 説明なし |

---

