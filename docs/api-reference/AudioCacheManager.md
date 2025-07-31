# AudioCacheManager

## 概要

ファイル: `audio/AudioCacheManager.js`  
最終更新: 2025/7/29 22:45:39

## 目次

## クラス
- [CacheNode](#cachenode)
- [LRUCache](#lrucache)
- [AudioCacheManager](#audiocachemanager)
## 定数
- [node](#node)
- [node](#node)
- [oldSize](#oldsize)
- [newNode](#newnode)
- [node](#node)
- [lru](#lru)
- [hitRate](#hitrate)
- [cacheConfig](#cacheconfig)
- [size](#size)
- [cacheEntry](#cacheentry)
- [startTime](#starttime)
- [cacheEntry](#cacheentry)
- [loadTime](#loadtime)
- [cachedBuffer](#cachedbuffer)
- [buffer](#buffer)
- [loadPromise](#loadpromise)
- [result](#result)
- [chunkSize](#chunksize)
- [metadata](#metadata)
- [fullBuffer](#fullbuffer)
- [totalChunks](#totalchunks)
- [chunks](#chunks)
- [startSample](#startsample)
- [endSample](#endsample)
- [chunkKey](#chunkkey)
- [chunkSize](#chunksize)
- [buffer](#buffer)
- [fullBuffer](#fullbuffer)
- [channels](#channels)
- [fullChannelData](#fullchanneldata)
- [chunkData](#chunkdata)
- [bufferChannelData](#bufferchanneldata)
- [chunkChannelData](#chunkchanneldata)
- [currentUsage](#currentusage)
- [optimizedBuffer](#optimizedbuffer)
- [optimizedSize](#optimizedsize)
- [cacheEntry](#cacheentry)
- [monoBuffer](#monobuffer)
- [leftChannel](#leftchannel)
- [rightChannel](#rightchannel)
- [monoChannel](#monochannel)
- [memoryUsage](#memoryusage)
- [pressureThreshold](#pressurethreshold)
- [bufferCacheUsage](#buffercacheusage)
- [metadataCacheUsage](#metadatacacheusage)
- [chunkCacheUsage](#chunkcacheusage)
- [totalUsage](#totalusage)
- [maxUsage](#maxusage)
- [memoryUsage](#memoryusage)
- [now](#now)
- [maxAge](#maxage)
- [targetReduction](#targetreduction)
- [now](#now)
- [expiredKeys](#expiredkeys)
- [entries](#entries)
- [targetSize](#targetsize)
- [now](#now)
- [timeSinceAccess](#timesinceaccess)
- [hitCountWeight](#hitcountweight)
- [sizeWeight](#sizeweight)
- [units](#units)
- [loadTimes](#loadtimes)
- [sum](#sum)

---

## CacheNode

### コンストラクタ

```javascript
new CacheNode(key, value, size)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `key` | 説明なし |
| `value` | 説明なし |
| `size` | 説明なし |
| `accessTime` | バイト単位のサイズ |
| `hitCount` | 説明なし |
| `prev` | 説明なし |
| `next` | 説明なし |


---

## LRUCache

### コンストラクタ

```javascript
new LRUCache(maxSize = 50 * 1024 * 1024)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `maxSize` | デフォルト50MB |
| `currentSize` | 説明なし |
| `cache` | 説明なし |
| `head` | ダミーノードで双方向リストを初期化 |
| `tail` | 説明なし |
| `stats` | 統計情報 |
| `currentSize` | 説明なし |
| `stats` | 統計をリセット |

### メソッド

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

#### set

**シグネチャ**:
```javascript
 set(key, value, size)
```

**パラメーター**:
- `key`
- `value`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.set(key, value, size);

// 設定値の更新
const success = instance.set('key', 'value');
if (success) {
    console.log('Setting updated successfully');
}
```

#### while

サイズ制限をチェックして必要に応じて削除

**シグネチャ**:
```javascript
 while (this.currentSize > this.maxSize)
```

**パラメーター**:
- `this.currentSize > this.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.currentSize > this.maxSize);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (lru !== this.head)
```

**パラメーター**:
- `lru !== this.head`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(lru !== this.head);

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


---

## AudioCacheManager

### コンストラクタ

```javascript
new AudioCacheManager(audioContext)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `audioContext` | 説明なし |
| `configManager` | 説明なし |
| `cacheSettings` | キャッシュ設定 |
| `audioBufferCache` | キャッシュインスタンス |
| `metadataCache` | 説明なし |
| `chunkCache` | 1MB for metadata |
| `memoryMonitor` | メモリ監視 |
| `lazyLoadManager` | 段階的読み込み管理 |
| `performanceStats` | パフォーマンス統計 |
| `audioBufferCache` | 参照をクリア |
| `metadataCache` | 説明なし |
| `chunkCache` | 説明なし |

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

#### if

メモリ設定の更新

**シグネチャ**:
```javascript
 if (cacheConfig.maxMemorySize)
```

**パラメーター**:
- `cacheConfig.maxMemorySize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheConfig.maxMemorySize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cacheConfig.maxEntries)
```

**パラメーター**:
- `cacheConfig.maxEntries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheConfig.maxEntries);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

クリーンアップ設定の更新

**シグネチャ**:
```javascript
 if (cacheConfig.cleanupInterval)
```

**パラメーター**:
- `cacheConfig.cleanupInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheConfig.cleanupInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cacheConfig.maxAge)
```

**パラメーター**:
- `cacheConfig.maxAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheConfig.maxAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

段階的読み込み設定の更新

**シグネチャ**:
```javascript
 if (cacheConfig.lazyLoading)
```

**パラメーター**:
- `cacheConfig.lazyLoading`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheConfig.lazyLoading);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

自動最適化設定の更新

**シグネチャ**:
```javascript
 if (cacheConfig.autoOptimization)
```

**パラメーター**:
- `cacheConfig.autoOptimization`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheConfig.autoOptimization);

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

#### if

**シグネチャ**:
```javascript
 if (this.memoryMonitor.intervalId)
```

**パラメーター**:
- `this.memoryMonitor.intervalId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.memoryMonitor.intervalId);

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

#### setAudioBuffer

**シグネチャ**:
```javascript
 setAudioBuffer(key, buffer, metadata = {})
```

**パラメーター**:
- `key`
- `buffer`
- `metadata = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setAudioBuffer(key, buffer, metadata = {});

// setAudioBufferの実用的な使用例
const result = instance.setAudioBuffer(/* 適切なパラメータ */);
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

#### getAudioBuffer

**シグネチャ**:
```javascript
 getAudioBuffer(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAudioBuffer(key);

// getAudioBufferの実用的な使用例
const result = instance.getAudioBuffer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cacheEntry)
```

**パラメーター**:
- `cacheEntry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cacheEntry);

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

#### getLazyAudioBuffer

**シグネチャ**:
```javascript
async getLazyAudioBuffer(key, loadFunction, options = {})
```

**パラメーター**:
- `key`
- `loadFunction`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getLazyAudioBuffer(key, loadFunction, options = {});

// getLazyAudioBufferの実用的な使用例
const result = instance.getLazyAudioBuffer(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cachedBuffer)
```

**パラメーター**:
- `cachedBuffer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cachedBuffer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

段階的読み込みが有効な場合

**シグネチャ**:
```javascript
 if (this.cacheSettings.lazyLoading.enabled)
```

**パラメーター**:
- `this.cacheSettings.lazyLoading.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.cacheSettings.lazyLoading.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (buffer)
```

**パラメーター**:
- `buffer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buffer);

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

#### if

**シグネチャ**:
```javascript
 if (!metadata)
```

**パラメーター**:
- `!metadata`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!metadata);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++)
```

**パラメーター**:
- `let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!chunkData)
```

**パラメーター**:
- `!chunkData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!chunkData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (chunkData)
```

**パラメーター**:
- `chunkData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(chunkData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (chunkData)
```

**パラメーター**:
- `chunkData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(chunkData);

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
 if (!buffer)
```

**パラメーター**:
- `!buffer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!buffer);

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
 if (!fullBuffer)
```

**パラメーター**:
- `!fullBuffer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!fullBuffer);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let channel = 0; channel < metadata.numberOfChannels; channel++)
```

**パラメーター**:
- `let channel = 0; channel < metadata.numberOfChannels; channel++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let channel = 0; channel < metadata.numberOfChannels; channel++);

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

#### forEach

**シグネチャ**:
```javascript
 forEach(chunk => {
                const { data, start } = chunk;
                
                for (let channel = 0; channel < metadata.numberOfChannels; channel++)
```

**パラメーター**:
- `chunk => {
                const { data`
- `start } = chunk;
                
                for (let channel = 0; channel < metadata.numberOfChannels; channel++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(chunk => {
                const { data, start } = chunk;
                
                for (let channel = 0; channel < metadata.numberOfChannels; channel++);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < chunkChannelData.length; i++)
```

**パラメーター**:
- `let i = 0; i < chunkChannelData.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < chunkChannelData.length; i++);

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

ステレオからモノラルへの変換（簡略化）

**シグネチャ**:
```javascript
 if (buffer.numberOfChannels === 2)
```

**パラメーター**:
- `buffer.numberOfChannels === 2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(buffer.numberOfChannels === 2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (let i = 0; i < buffer.length; i++)
```

**パラメーター**:
- `let i = 0; i < buffer.length; i++`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(let i = 0; i < buffer.length; i++);

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
 if (memoryUsage.ratio > pressureThreshold)
```

**パラメーター**:
- `memoryUsage.ratio > pressureThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(memoryUsage.ratio > pressureThreshold);

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

統計データを最大100件に制限

**シグネチャ**:
```javascript
 if (this.performanceStats.memoryUsage.length > 100)
```

**パラメーター**:
- `this.performanceStats.memoryUsage.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.performanceStats.memoryUsage.length > 100);

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

AudioBufferキャッシュから期限切れを検索

**シグネチャ**:
```javascript
 for (const [key, node] of this.audioBufferCache.cache)
```

**パラメーター**:
- `const [key`
- `node] of this.audioBufferCache.cache`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, node] of this.audioBufferCache.cache);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - node.accessTime > maxAge)
```

**パラメーター**:
- `now - node.accessTime > maxAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - node.accessTime > maxAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (expiredKeys.length > 0)
```

**パラメーター**:
- `expiredKeys.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(expiredKeys.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

全エントリの使用頻度情報を収集

**シグネチャ**:
```javascript
 for (const [key, node] of this.audioBufferCache.cache)
```

**パラメーター**:
- `const [key`
- `node] of this.audioBufferCache.cache`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [key, node] of this.audioBufferCache.cache);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const entry of entries)
```

**パラメーター**:
- `const entry of entries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const entry of entries);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (removedSize >= targetSize)
```

**パラメーター**:
- `removedSize >= targetSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(removedSize >= targetSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

**シグネチャ**:
```javascript
 while (size >= 1024 && unitIndex < units.length - 1)
```

**パラメーター**:
- `size >= 1024 && unitIndex < units.length - 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(size >= 1024 && unitIndex < units.length - 1);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setMaxCacheSize

**シグネチャ**:
```javascript
 setMaxCacheSize(maxSize)
```

**パラメーター**:
- `maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setMaxCacheSize(maxSize);

// setMaxCacheSizeの実用的な使用例
const result = instance.setMaxCacheSize(/* 適切なパラメータ */);
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

#### getCacheStats

**シグネチャ**:
```javascript
 getCacheStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCacheStats();

// getCacheStatsの実用的な使用例
const result = instance.getCacheStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (loadTimes.length === 0)
```

**パラメーター**:
- `loadTimes.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(loadTimes.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearCache

**シグネチャ**:
```javascript
 clearCache(type = 'all')
```

**パラメーター**:
- `type = 'all'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearCache(type = 'all');

// clearCacheの実用的な使用例
const result = instance.clearCache(/* 適切なパラメータ */);
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

#### dispose

**シグネチャ**:
```javascript
 dispose()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.dispose();

// disposeの実用的な使用例
const result = instance.dispose(/* 適切なパラメータ */);
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
| `node` | 説明なし |
| `node` | 説明なし |
| `oldSize` | 説明なし |
| `newNode` | 説明なし |
| `node` | 説明なし |
| `lru` | 説明なし |
| `hitRate` | 説明なし |
| `cacheConfig` | 説明なし |
| `size` | 説明なし |
| `cacheEntry` | 説明なし |
| `startTime` | 説明なし |
| `cacheEntry` | 説明なし |
| `loadTime` | 説明なし |
| `cachedBuffer` | 説明なし |
| `buffer` | 説明なし |
| `loadPromise` | 説明なし |
| `result` | 説明なし |
| `chunkSize` | 説明なし |
| `metadata` | 説明なし |
| `fullBuffer` | 説明なし |
| `totalChunks` | 説明なし |
| `chunks` | 説明なし |
| `startSample` | 説明なし |
| `endSample` | 説明なし |
| `chunkKey` | 説明なし |
| `chunkSize` | 説明なし |
| `buffer` | 説明なし |
| `fullBuffer` | 説明なし |
| `channels` | 説明なし |
| `fullChannelData` | 説明なし |
| `chunkData` | 説明なし |
| `bufferChannelData` | 説明なし |
| `chunkChannelData` | 説明なし |
| `currentUsage` | 説明なし |
| `optimizedBuffer` | 説明なし |
| `optimizedSize` | 説明なし |
| `cacheEntry` | 説明なし |
| `monoBuffer` | 説明なし |
| `leftChannel` | 説明なし |
| `rightChannel` | 説明なし |
| `monoChannel` | 説明なし |
| `memoryUsage` | 説明なし |
| `pressureThreshold` | 説明なし |
| `bufferCacheUsage` | 説明なし |
| `metadataCacheUsage` | 説明なし |
| `chunkCacheUsage` | 説明なし |
| `totalUsage` | 説明なし |
| `maxUsage` | 説明なし |
| `memoryUsage` | 説明なし |
| `now` | 説明なし |
| `maxAge` | 説明なし |
| `targetReduction` | 説明なし |
| `now` | 説明なし |
| `expiredKeys` | 説明なし |
| `entries` | 説明なし |
| `targetSize` | 説明なし |
| `now` | 説明なし |
| `timeSinceAccess` | 説明なし |
| `hitCountWeight` | 説明なし |
| `sizeWeight` | 説明なし |
| `units` | 説明なし |
| `loadTimes` | 説明なし |
| `sum` | 説明なし |

---

