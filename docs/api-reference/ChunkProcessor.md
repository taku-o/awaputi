# ChunkProcessor

## 概要

ファイル: `core/ChunkProcessor.js`  
最終更新: 2025/7/29 10:26:52

## 目次

## クラス
- [ChunkProcessor](#chunkprocessor)
## 関数
- [getChunkProcessor()](#getchunkprocessor)
## 定数
- [processId](#processid)
- [chunkSize](#chunksize)
- [startTime](#starttime)
- [processInfo](#processinfo)
- [chunk](#chunk)
- [chunkIndex](#chunkindex)
- [chunkStartTime](#chunkstarttime)
- [chunkResult](#chunkresult)
- [chunkDuration](#chunkduration)
- [totalDuration](#totalduration)
- [results](#results)
- [entries](#entries)
- [processId](#processid)
- [chunkSize](#chunksize)
- [results](#results)
- [chunkObject](#chunkobject)
- [processId](#processid)
- [batchSize](#batchsize)
- [results](#results)
- [item](#item)
- [batchResult](#batchresult)
- [batchResult](#batchresult)
- [result](#result)
- [dataSize](#datasize)
- [currentAvg](#currentavg)
- [callbacks](#callbacks)
- [index](#index)

---

## ChunkProcessor

### コンストラクタ

```javascript
new ChunkProcessor(options = {})
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `defaultChunkSize` | 設定 |
| `maxMemoryUsage` | デフォルトチャンクサイズ |
| `progressInterval` | 50MB |
| `yieldInterval` | プログレス更新間隔 |
| `activeProcesses` | 状態管理 |
| `memoryUsage` | 説明なし |
| `processCounter` | 説明なし |
| `stats` | 統計情報 |
| `listeners` | イベントリスナー |
| `yieldInterval` | 説明なし |
| `memoryUsage` | メモリ使用量をリセット |
| `memoryUsage` | 説明なし |

### メソッド

#### processArray

**シグネチャ**:
```javascript
async processArray(data, processor, options = {})
```

**パラメーター**:
- `data`
- `processor`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processArray(data, processor, options = {});

// processArrayの実用的な使用例
const result = instance.processArray(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

チャンクに分割して処理

**シグネチャ**:
```javascript
 for (let i = 0; i < data.length; i += chunkSize)
```

**パラメーター**:
- `let i = 0; i < data.length; i += chunkSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < data.length; i += chunkSize);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

結果を保存

**シグネチャ**:
```javascript
 if (options.collectResults !== false)
```

**パラメーター**:
- `options.collectResults !== false`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.collectResults !== false);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

定期的にイベントループに制御を戻す

**シグネチャ**:
```javascript
 if (chunkIndex % this.yieldInterval === 0)
```

**パラメーター**:
- `chunkIndex % this.yieldInterval === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(chunkIndex % this.yieldInterval === 0);

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

#### processObject

**シグネチャ**:
```javascript
async processObject(data, processor, options = {})
```

**パラメーター**:
- `data`
- `processor`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processObject(data, processor, options = {});

// processObjectの実用的な使用例
const result = instance.processObject(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof data !== 'object' || data === null)
```

**パラメーター**:
- `typeof data !== 'object' || data === null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof data !== 'object' || data === null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

結果をオブジェクトに再構成

**シグネチャ**:
```javascript
 if (options.mergeResults !== false)
```

**パラメーター**:
- `options.mergeResults !== false`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.mergeResults !== false);

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

#### processStream

**シグネチャ**:
```javascript
async processStream(dataProvider, processor, options = {})
```

**パラメーター**:
- `dataProvider`
- `processor`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processStream(dataProvider, processor, options = {});

// processStreamの実用的な使用例
const result = instance.processStream(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (hasMore)
```

**パラメーター**:
- `hasMore`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(hasMore);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (item === null || item === undefined)
```

**パラメーター**:
- `item === null || item === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(item === null || item === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

残りのバッチを処理

**シグネチャ**:
```javascript
 if (batch.length > 0)
```

**パラメーター**:
- `batch.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(batch.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッチサイズに達したら処理

**シグネチャ**:
```javascript
 if (batch.length >= batchSize)
```

**パラメーター**:
- `batch.length >= batchSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(batch.length >= batchSize);

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

#### processChunk

**シグネチャ**:
```javascript
async processChunk(chunk, processor, chunkIndex, processInfo, options)
```

**パラメーター**:
- `chunk`
- `processor`
- `chunkIndex`
- `processInfo`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.processChunk(chunk, processor, chunkIndex, processInfo, options);

// processChunkの実用的な使用例
const result = instance.processChunk(/* 適切なパラメータ */);
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

#### checkMemoryUsage

**シグネチャ**:
```javascript
async checkMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkMemoryUsage();

// checkMemoryUsageの実用的な使用例
const result = instance.checkMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.memoryUsage > this.maxMemoryUsage)
```

**パラメーター**:
- `this.memoryUsage > this.maxMemoryUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.memoryUsage > this.maxMemoryUsage);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メモリ使用量が上限を超えた場合、ガベージコレクションを実行

**シグネチャ**:
```javascript
 if (global.gc)
```

**パラメーター**:
- `global.gc`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(global.gc);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateMemoryUsage

**シグネチャ**:
```javascript
 updateMemoryUsage(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateMemoryUsage(data);

// updateMemoryUsageの実用的な使用例
const result = instance.updateMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.memoryUsage > this.stats.memoryPeakUsage)
```

**パラメーター**:
- `this.memoryUsage > this.stats.memoryPeakUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.memoryUsage > this.stats.memoryPeakUsage);

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

#### yieldControl

**シグネチャ**:
```javascript
async yieldControl()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.yieldControl();

// yieldControlの実用的な使用例
const result = instance.yieldControl(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateChunkStats

**シグネチャ**:
```javascript
 updateChunkStats(duration)
```

**パラメーター**:
- `duration`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateChunkStats(duration);

// updateChunkStatsの実用的な使用例
const result = instance.updateChunkStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateProcessStats

**シグネチャ**:
```javascript
 updateProcessStats(duration, chunksProcessed)
```

**パラメーター**:
- `duration`
- `chunksProcessed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateProcessStats(duration, chunksProcessed);

// updateProcessStatsの実用的な使用例
const result = instance.updateProcessStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergeChunkResults

**シグネチャ**:
```javascript
 mergeChunkResults(results, options)
```

**パラメーター**:
- `results`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergeChunkResults(results, options);

// mergeChunkResultsの実用的な使用例
const result = instance.mergeChunkResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (options.mergeStrategy === 'object')
```

**パラメーター**:
- `options.mergeStrategy === 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.mergeStrategy === 'object');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (options.mergeStrategy === 'array')
```

**パラメーター**:
- `options.mergeStrategy === 'array'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(options.mergeStrategy === 'array');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof options.customMerger === 'function')
```

**パラメーター**:
- `typeof options.customMerger === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof options.customMerger === 'function');

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

#### generateProcessId

**シグネチャ**:
```javascript
 generateProcessId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateProcessId();

// generateProcessIdの実用的な使用例
const result = instance.generateProcessId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getActiveProcesses

**シグネチャ**:
```javascript
 getActiveProcesses()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getActiveProcesses();

// getActiveProcessesの実用的な使用例
const result = instance.getActiveProcesses(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getStats

**シグネチャ**:
```javascript
 getStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStats();

// getStatsの実用的な使用例
const result = instance.getStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cancelProcess

**シグネチャ**:
```javascript
 cancelProcess(processId)
```

**パラメーター**:
- `processId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cancelProcess(processId);

// cancelProcessの実用的な使用例
const result = instance.cancelProcess(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### on

**シグネチャ**:
```javascript
 on(event, callback)
```

**パラメーター**:
- `event`
- `callback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.on(event, callback);

// onの実用的な使用例
const result = instance.on(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### off

**シグネチャ**:
```javascript
 off(event, callback)
```

**パラメーター**:
- `event`
- `callback`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.off(event, callback);

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


---

## getChunkProcessor

**シグネチャ**:
```javascript
getChunkProcessor()
```

**使用例**:
```javascript
const result = getChunkProcessor();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `processId` | 説明なし |
| `chunkSize` | 説明なし |
| `startTime` | 説明なし |
| `processInfo` | 説明なし |
| `chunk` | 説明なし |
| `chunkIndex` | 説明なし |
| `chunkStartTime` | 説明なし |
| `chunkResult` | 説明なし |
| `chunkDuration` | 説明なし |
| `totalDuration` | 説明なし |
| `results` | 説明なし |
| `entries` | 説明なし |
| `processId` | 説明なし |
| `chunkSize` | 説明なし |
| `results` | 説明なし |
| `chunkObject` | 説明なし |
| `processId` | 説明なし |
| `batchSize` | 説明なし |
| `results` | 説明なし |
| `item` | 説明なし |
| `batchResult` | 説明なし |
| `batchResult` | 説明なし |
| `result` | 説明なし |
| `dataSize` | 説明なし |
| `currentAvg` | 説明なし |
| `callbacks` | 説明なし |
| `index` | 説明なし |

---

