# TranslationCache

## 概要

ファイル: `core/i18n/TranslationCache.js`  
最終更新: 2025/7/30 23:50:51

## 目次

## クラス
- [TranslationCache](#translationcache)
## 定数
- [cacheKey](#cachekey)
- [cached](#cached)
- [cacheKey](#cachekey)
- [cacheEntry](#cacheentry)
- [entry](#entry)
- [index](#index)
- [lruKey](#lrukey)
- [cacheKey](#cachekey)
- [deleted](#deleted)
- [keysToDelete](#keystodelete)
- [size](#size)
- [totalRequests](#totalrequests)
- [hitRate](#hitrate)
- [expiredKeys](#expiredkeys)
- [languages](#languages)
- [keyPatterns](#keypatterns)
- [langStats](#langstats)
- [keyPrefix](#keyprefix)
- [patternStats](#patternstats)
- [entries](#entries)
- [entries](#entries)

---

## TranslationCache

### コンストラクタ

```javascript
new TranslationCache(maxSize = 1000)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `maxSize` | 説明なし |
| `cache` | 説明なし |
| `accessOrder` | 説明なし |
| `hitCount` | LRU管理用 |
| `missCount` | 説明なし |
| `evictionCount` | 説明なし |
| `cleanupInterval` | キャッシュクリーンアップのタイマー |
| `accessOrder` | 説明なし |
| `maxSize` | 説明なし |
| `hitCount` | 説明なし |
| `missCount` | 説明なし |
| `evictionCount` | 説明なし |
| `cleanupInterval` | 説明なし |
| `cleanupInterval` | 説明なし |

### メソッド

#### get

**シグネチャ**:
```javascript
 get(key, language = 'ja')
```

**パラメーター**:
- `key`
- `language = 'ja'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.get(key, language = 'ja');

// 設定値の取得
const value = instance.get('key', 'defaultValue');
console.log('Retrieved value:', value);
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

#### set

**シグネチャ**:
```javascript
 set(key, value, language = 'ja', ttl = null)
```

**パラメーター**:
- `key`
- `value`
- `language = 'ja'`
- `ttl = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.set(key, value, language = 'ja', ttl = null);

// 設定値の更新
const success = instance.set('key', 'value');
if (success) {
    console.log('Setting updated successfully');
}
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

#### generateCacheKey

**シグネチャ**:
```javascript
 generateCacheKey(key, language)
```

**パラメーター**:
- `key`
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCacheKey(key, language);

// generateCacheKeyの実用的な使用例
const result = instance.generateCacheKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isExpired

**シグネチャ**:
```javascript
 isExpired(cacheEntry)
```

**パラメーター**:
- `cacheEntry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isExpired(cacheEntry);

// isExpiredの実用的な使用例
const result = instance.isExpired(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!cacheEntry.ttl)
```

**パラメーター**:
- `!cacheEntry.ttl`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!cacheEntry.ttl);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateAccessOrder

**シグネチャ**:
```javascript
 updateAccessOrder(cacheKey)
```

**パラメーター**:
- `cacheKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateAccessOrder(cacheKey);

// updateAccessOrderの実用的な使用例
const result = instance.updateAccessOrder(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (entry)
```

**パラメーター**:
- `entry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(entry);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeFromAccessOrder

**シグネチャ**:
```javascript
 removeFromAccessOrder(cacheKey)
```

**パラメーター**:
- `cacheKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeFromAccessOrder(cacheKey);

// removeFromAccessOrderの実用的な使用例
const result = instance.removeFromAccessOrder(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (this.accessOrder.length === 0)
```

**パラメーター**:
- `this.accessOrder.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.accessOrder.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### delete

**シグネチャ**:
```javascript
 delete(key, language = 'ja')
```

**パラメーター**:
- `key`
- `language = 'ja'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.delete(key, language = 'ja');

// deleteの実用的な使用例
const result = instance.delete(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (deleted)
```

**パラメーター**:
- `deleted`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(deleted);

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

#### clearLanguage

**シグネチャ**:
```javascript
 clearLanguage(language)
```

**パラメーター**:
- `language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearLanguage(language);

// clearLanguageの実用的な使用例
const result = instance.clearLanguage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (entry.language === language)
```

**パラメーター**:
- `entry.language === language`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(entry.language === language);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of keysToDelete)
```

**パラメーター**:
- `const key of keysToDelete`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of keysToDelete);

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

#### resize

**シグネチャ**:
```javascript
 resize(newSize)
```

**パラメーター**:
- `newSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resize(newSize);

// resizeの実用的な使用例
const result = instance.resize(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (newSize < 1)
```

**パラメーター**:
- `newSize < 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newSize < 1);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

現在のサイズが新しいサイズを超えている場合、LRUで削除

**シグネチャ**:
```javascript
 while (this.cache.size > this.maxSize)
```

**パラメーター**:
- `this.cache.size > this.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.cache.size > this.maxSize);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
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

#### estimateMemoryUsage

**シグネチャ**:
```javascript
 estimateMemoryUsage()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.estimateMemoryUsage();

// estimateMemoryUsageの実用的な使用例
const result = instance.estimateMemoryUsage(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

値のサイズ

**シグネチャ**:
```javascript
 if (typeof entry.value === 'string')
```

**パラメーター**:
- `typeof entry.value === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof entry.value === 'string');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetStats

**シグネチャ**:
```javascript
 resetStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetStats();

// resetStatsの実用的な使用例
const result = instance.resetStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startPeriodicCleanup

**シグネチャ**:
```javascript
 startPeriodicCleanup(intervalMs = 300000)
```

**パラメーター**:
- `intervalMs = 300000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startPeriodicCleanup(intervalMs = 300000);

// startPeriodicCleanupの実用的な使用例
const result = instance.startPeriodicCleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### stopPeriodicCleanup

**シグネチャ**:
```javascript
 stopPeriodicCleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopPeriodicCleanup();

// stopPeriodicCleanupの実用的な使用例
const result = instance.stopPeriodicCleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.cleanupInterval)
```

**パラメーター**:
- `this.cleanupInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.cleanupInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupExpiredEntries

**シグネチャ**:
```javascript
 cleanupExpiredEntries()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupExpiredEntries();

// cleanupExpiredEntriesの実用的な使用例
const result = instance.cleanupExpiredEntries(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const key of expiredKeys)
```

**パラメーター**:
- `const key of expiredKeys`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const key of expiredKeys);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
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

#### getDetailedInfo

**シグネチャ**:
```javascript
 getDetailedInfo()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDetailedInfo();

// getDetailedInfoの実用的な使用例
const result = instance.getDetailedInfo(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getOldestEntries

**シグネチャ**:
```javascript
 getOldestEntries(count = 5)
```

**パラメーター**:
- `count = 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getOldestEntries(count = 5);

// getOldestEntriesの実用的な使用例
const result = instance.getOldestEntries(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMostAccessedEntries

**シグネチャ**:
```javascript
 getMostAccessedEntries(count = 5)
```

**パラメーター**:
- `count = 5`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMostAccessedEntries(count = 5);

// getMostAccessedEntriesの実用的な使用例
const result = instance.getMostAccessedEntries(/* 適切なパラメータ */);
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
| `cacheKey` | 説明なし |
| `cached` | 説明なし |
| `cacheKey` | 説明なし |
| `cacheEntry` | 説明なし |
| `entry` | 説明なし |
| `index` | 説明なし |
| `lruKey` | 説明なし |
| `cacheKey` | 説明なし |
| `deleted` | 説明なし |
| `keysToDelete` | 説明なし |
| `size` | 説明なし |
| `totalRequests` | 説明なし |
| `hitRate` | 説明なし |
| `expiredKeys` | 説明なし |
| `languages` | 説明なし |
| `keyPatterns` | 説明なし |
| `langStats` | 説明なし |
| `keyPrefix` | 説明なし |
| `patternStats` | 説明なし |
| `entries` | 説明なし |
| `entries` | 説明なし |

---

