# DataCache

## 概要

ファイル: `core/DataCache.js`  
最終更新: 2025/7/29 10:26:52

## 目次

## クラス
- [DataCache](#datacache)
## 関数
- [getDataCache()](#getdatacache)
## 定数
- [now](#now)
- [ttl](#ttl)
- [priority](#priority)
- [dataSize](#datasize)
- [cacheEntry](#cacheentry)
- [entry](#entry)
- [now](#now)
- [startTime](#starttime)
- [generationTime](#generationtime)
- [dataSize](#datasize)
- [tagsArray](#tagsarray)
- [keysToDelete](#keystodelete)
- [deletedCount](#deletedcount)
- [keysToDelete](#keystodelete)
- [deletedCount](#deletedcount)
- [entryCount](#entrycount)
- [memoryUsage](#memoryusage)
- [sortedEntries](#sortedentries)
- [metadata](#metadata)
- [targetMemoryUsage](#targetmemoryusage)
- [now](#now)
- [expiredKeys](#expiredkeys)
- [deletedCount](#deletedcount)
- [type](#type)
- [hitRate](#hitrate)
- [entry](#entry)
- [callbacks](#callbacks)
- [index](#index)

---

## DataCache

### コンストラクタ

```javascript
new DataCache(options = {})
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `maxSize` | 設定 |
| `maxMemory` | 最大キャッシュエントリ数 |
| `ttl` | 50MB |
| `cleanupInterval` | 5分のTTL |
| `cache` | キャッシュストレージ |
| `accessOrder` | 説明なし |
| `lastAccess` | アクセス順序管理用 |
| `keyMetadata` | 最終アクセス時刻 |
| `currentMemoryUsage` | メモリ使用量管理 |
| `sizeEstimator` | 説明なし |
| `stats` | 統計情報 |
| `listeners` | イベントリスナー |
| `cleanupTimer` | クリーンアップタイマー |
| `currentMemoryUsage` | 説明なし |
| `cleanupTimer` | 説明なし |
| `cleanupTimer` | 説明なし |

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

#### set

**シグネチャ**:
```javascript
 set(key, value, options = {})
```

**パラメーター**:
- `key`
- `value`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.set(key, value, options = {});

// 設定値の更新
const success = instance.set('key', 'value');
if (success) {
    console.log('Setting updated successfully');
}
```

#### if

メモリ使用量チェック

**シグネチャ**:
```javascript
 if (this.currentMemoryUsage + dataSize > this.maxMemory)
```

**パラメーター**:
- `this.currentMemoryUsage + dataSize > this.maxMemory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentMemoryUsage + dataSize > this.maxMemory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentMemoryUsage > this.stats.memoryPeakUsage)
```

**パラメーター**:
- `this.currentMemoryUsage > this.stats.memoryPeakUsage`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentMemoryUsage > this.stats.memoryPeakUsage);

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

#### get

**シグネチャ**:
```javascript
 get(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.get(key);

// 設定値の取得
const value = instance.get('key', 'defaultValue');
console.log('Retrieved value:', value);
```

#### if

**シグネチャ**:
```javascript
 if (!entry)
```

**パラメーター**:
- `!entry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!entry);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

TTLチェック

**シグネチャ**:
```javascript
 if (entry.expiresAt <= now)
```

**パラメーター**:
- `entry.expiresAt <= now`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(entry.expiresAt <= now);

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

#### getOrSet

**シグネチャ**:
```javascript
async getOrSet(key, valueProvider, options = {})
```

**パラメーター**:
- `key`
- `valueProvider`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getOrSet(key, valueProvider, options = {});

// getOrSetの実用的な使用例
const result = instance.getOrSet(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value !== undefined)
```

**パラメーター**:
- `value !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value !== undefined);

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

#### delete

**シグネチャ**:
```javascript
 delete(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.delete(key);

// deleteの実用的な使用例
const result = instance.delete(/* 適切なパラメータ */);
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

#### deleteMany

**シグネチャ**:
```javascript
 deleteMany(keys)
```

**パラメーター**:
- `keys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deleteMany(keys);

// deleteManyの実用的な使用例
const result = instance.deleteMany(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of keys)
```

**パラメーター**:
- `const key of keys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of keys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### invalidateByTag

**シグネチャ**:
```javascript
 invalidateByTag(tags)
```

**パラメーター**:
- `tags`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.invalidateByTag(tags);

// invalidateByTagの実用的な使用例
const result = instance.invalidateByTag(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### invalidateByDependency

**シグネチャ**:
```javascript
 invalidateByDependency(dependency)
```

**パラメーター**:
- `dependency`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.invalidateByDependency(dependency);

// invalidateByDependencyの実用的な使用例
const result = instance.invalidateByDependency(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clear

**シグネチャ**:
```javascript
 clear()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clear();

// clearの実用的な使用例
const result = instance.clear(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### evictLeastRecentlyUsed

**シグネチャ**:
```javascript
 evictLeastRecentlyUsed()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.evictLeastRecentlyUsed();

// evictLeastRecentlyUsedの実用的な使用例
const result = instance.evictLeastRecentlyUsed(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

まず低優先度のアイテムを探す

**シグネチャ**:
```javascript
 for (const [key] of sortedEntries)
```

**パラメーター**:
- `const [key] of sortedEntries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key] of sortedEntries);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (metadata && metadata.priority === 'low')
```

**パラメーター**:
- `metadata && metadata.priority === 'low'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(metadata && metadata.priority === 'low');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

低優先度がない場合は最も古いアイテム

**シグネチャ**:
```javascript
 if (!keyToEvict && sortedEntries.length > 0)
```

**パラメーター**:
- `!keyToEvict && sortedEntries.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!keyToEvict && sortedEntries.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (keyToEvict)
```

**パラメーター**:
- `keyToEvict`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(keyToEvict);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### evictToMakeSpace

**シグネチャ**:
```javascript
 evictToMakeSpace(requiredSpace)
```

**パラメーター**:
- `requiredSpace`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.evictToMakeSpace(requiredSpace);

// evictToMakeSpaceの実用的な使用例
const result = instance.evictToMakeSpace(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (this.currentMemoryUsage > targetMemoryUsage && this.cache.size > 0)
```

**パラメーター**:
- `this.currentMemoryUsage > targetMemoryUsage && this.cache.size > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.currentMemoryUsage > targetMemoryUsage && this.cache.size > 0);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
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

**シグネチャ**:
```javascript
 if (entry.expiresAt <= now)
```

**パラメーター**:
- `entry.expiresAt <= now`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(entry.expiresAt <= now);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (deletedCount > 0)
```

**パラメーター**:
- `deletedCount > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deletedCount > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### estimateSize

**シグネチャ**:
```javascript
 estimateSize(value)
```

**パラメーター**:
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateSize(value);

// estimateSizeの実用的な使用例
const result = instance.estimateSize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (value === null || value === undefined)
```

**パラメーター**:
- `value === null || value === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(value === null || value === undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
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

#### startCleanupTimer

**シグネチャ**:
```javascript
 startCleanupTimer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startCleanupTimer();

// startCleanupTimerの実用的な使用例
const result = instance.startCleanupTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.cleanupTimer)
```

**パラメーター**:
- `this.cleanupTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.cleanupTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopCleanupTimer

**シグネチャ**:
```javascript
 stopCleanupTimer()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopCleanupTimer();

// stopCleanupTimerの実用的な使用例
const result = instance.stopCleanupTimer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.cleanupTimer)
```

**パラメーター**:
- `this.cleanupTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.cleanupTimer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### has

**シグネチャ**:
```javascript
 has(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.has(key);

// hasの実用的な使用例
const result = instance.has(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### keys

**シグネチャ**:
```javascript
 keys()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.keys();

// keysの実用的な使用例
const result = instance.keys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### size

**シグネチャ**:
```javascript
 size()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.size();

// sizeの実用的な使用例
const result = instance.size(/* 適切なパラメータ */);
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

## getDataCache

**シグネチャ**:
```javascript
getDataCache()
```

**使用例**:
```javascript
const result = getDataCache();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `now` | 説明なし |
| `ttl` | 説明なし |
| `priority` | 説明なし |
| `dataSize` | 説明なし |
| `cacheEntry` | 説明なし |
| `entry` | 説明なし |
| `now` | 説明なし |
| `startTime` | 説明なし |
| `generationTime` | 説明なし |
| `dataSize` | 説明なし |
| `tagsArray` | 説明なし |
| `keysToDelete` | 説明なし |
| `deletedCount` | 説明なし |
| `keysToDelete` | 説明なし |
| `deletedCount` | 説明なし |
| `entryCount` | 説明なし |
| `memoryUsage` | 説明なし |
| `sortedEntries` | 説明なし |
| `metadata` | 説明なし |
| `targetMemoryUsage` | 説明なし |
| `now` | 説明なし |
| `expiredKeys` | 説明なし |
| `deletedCount` | 説明なし |
| `type` | 説明なし |
| `hitRate` | 説明なし |
| `entry` | 説明なし |
| `callbacks` | 説明なし |
| `index` | 説明なし |

---

