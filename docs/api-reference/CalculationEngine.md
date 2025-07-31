# CalculationEngine

## 概要

ファイル: `core/CalculationEngine.js`  
最終更新: 2025/7/26 20:49:00

## 目次

## クラス
- [CalculationEngine](#calculationengine)
## 関数
- [getCalculationEngine()](#getcalculationengine)
## 定数
- [cacheKey](#cachekey)
- [cachedResult](#cachedresult)
- [calculator](#calculator)
- [startTime](#starttime)
- [result](#result)
- [endTime](#endtime)
- [calculationTime](#calculationtime)
- [memoKey](#memokey)
- [result](#result)
- [batchKey](#batchkey)
- [batch](#batch)
- [batch](#batch)
- [calculator](#calculator)
- [allParams](#allparams)
- [results](#results)
- [result](#result)
- [paramString](#paramstring)
- [cached](#cached)
- [expiry](#expiry)
- [now](#now)
- [keysToDelete](#keystodelete)
- [keysToDelete](#keystodelete)
- [size](#size)
- [hitRate](#hitrate)
- [cached](#cached)
- [now](#now)
- [adaptiveTtl](#adaptivettl)
- [now](#now)
- [frequency](#frequency)
- [frequency](#frequency)
- [now](#now)
- [timeSinceLastAccess](#timesincelastaccess)
- [accessFrequency](#accessfrequency)
- [calculationCost](#calculationcost)
- [score](#score)
- [currentCount](#currentcount)
- [entries](#entries)
- [toDelete](#todelete)
- [key](#key)
- [stats](#stats)
- [frequentEntries](#frequententries)
- [heavyCalculations](#heavycalculations)
- [extensionTime](#extensiontime)
- [stats](#stats)
- [hitRate](#hitrate)
- [calculator](#calculator)
- [targetMethods](#targetmethods)
- [basicStats](#basicstats)
- [performanceSummary](#performancesummary)
- [frequentCalculations](#frequentcalculations)

---

## CalculationEngine

### コンストラクタ

```javascript
new CalculationEngine()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `calculators` | 計算処理クラスの登録 |
| `cache` | 計算結果のキャッシュ（階層化） |
| `cacheStats` | キャッシュ統計（詳細版） |
| `performanceStats` | 計算パフォーマンス統計 |
| `frequentCalculations` | 頻繁に使用される計算のトラッキング |
| `cacheConfig` | キャッシュ設定（最適化版） |
| `optimizationConfig` | 計算最適化設定 |
| `batchQueue` | バッチ処理キュー |

### メソッド

#### registerCalculator

**シグネチャ**:
```javascript
 registerCalculator(type, calculator)
```

**パラメーター**:
- `type`
- `calculator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerCalculator(type, calculator);

// registerCalculatorの実用的な使用例
const result = instance.registerCalculator(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!type || !calculator)
```

**パラメーター**:
- `!type || !calculator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!type || !calculator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculate

**シグネチャ**:
```javascript
 calculate(type, method, params = [], options = {})
```

**パラメーター**:
- `type`
- `method`
- `params = []`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculate(type, method, params = [], options = {});

// calculateの実用的な使用例
const result = instance.calculate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッチ処理が有効で、バッチ可能な計算の場合

**シグネチャ**:
```javascript
 if (this.optimizationConfig.batchProcessing && options.batchable)
```

**パラメーター**:
- `this.optimizationConfig.batchProcessing && options.batchable`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationConfig.batchProcessing && options.batchable);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

インテリジェントキャッシュから結果を取得

**シグネチャ**:
```javascript
 if (!options.noCache)
```

**パラメーター**:
- `!options.noCache`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!options.noCache);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cachedResult !== null)
```

**パラメーター**:
- `cachedResult !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cachedResult !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!calculator)
```

**パラメーター**:
- `!calculator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!calculator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メソッドの存在確認

**シグネチャ**:
```javascript
 if (typeof calculator[method] !== 'function')
```

**パラメーター**:
- `typeof calculator[method] !== 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof calculator[method] !== 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

結果をインテリジェントキャッシュに保存

**シグネチャ**:
```javascript
 if (!options.noCache)
```

**パラメーター**:
- `!options.noCache`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!options.noCache);

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

メモ化が有効で、メモ化可能な計算の場合

**シグネチャ**:
```javascript
 if (this.optimizationConfig.memoization && calculator._memoized)
```

**パラメーター**:
- `this.optimizationConfig.memoization && calculator._memoized`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.optimizationConfig.memoization && calculator._memoized);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!calculator._memoized[method])
```

**パラメーター**:
- `!calculator._memoized[method]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!calculator._memoized[method]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッチ処理のタイマーを設定（まだ設定されていない場合）

**シグネチャ**:
```javascript
 if (!batch.timeout)
```

**パラメーター**:
- `!batch.timeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!batch.timeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バッチメソッドが存在する場合はそれを使用

**シグネチャ**:
```javascript
 if (typeof calculator[`${method}Batch`] === 'function')
```

**パラメーター**:
- `typeof calculator[`${method}Batch`] === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof calculator[`${method}Batch`] === 'function');

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

#### generateCacheKey

**シグネチャ**:
```javascript
 generateCacheKey(type, method, params)
```

**パラメーター**:
- `type`
- `method`
- `params`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCacheKey(type, method, params);

// generateCacheKeyの実用的な使用例
const result = instance.generateCacheKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCachedResult

**シグネチャ**:
```javascript
 getCachedResult(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCachedResult(key);

// getCachedResultの実用的な使用例
const result = instance.getCachedResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!cached)
```

**パラメーター**:
- `!cached`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!cached);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCachedResult

**シグネチャ**:
```javascript
 setCachedResult(key, result)
```

**パラメーター**:
- `key`
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCachedResult(key, result);

// setCachedResultの実用的な使用例
const result = instance.setCachedResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

キャッシュサイズ制限チェック（新しいエントリを追加する前に）

**シグネチャ**:
```javascript
 while (this.cache.size >= this.cacheConfig.maxSize)
```

**パラメーター**:
- `this.cache.size >= this.cacheConfig.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.cache.size >= this.cacheConfig.maxSize);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupOldestCache

**シグネチャ**:
```javascript
 cleanupOldestCache()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOldestCache();

// cleanupOldestCacheの実用的な使用例
const result = instance.cleanupOldestCache(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (cached.timestamp < oldestTime)
```

**パラメーター**:
- `cached.timestamp < oldestTime`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(cached.timestamp < oldestTime);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (oldestKey)
```

**パラメーター**:
- `oldestKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(oldestKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupExpiredCache

**シグネチャ**:
```javascript
 cleanupExpiredCache()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupExpiredCache();

// cleanupExpiredCacheの実用的な使用例
const result = instance.cleanupExpiredCache(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now > cached.expiry)
```

**パラメーター**:
- `now > cached.expiry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now > cached.expiry);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (keysToDelete.length > 0)
```

**パラメーター**:
- `keysToDelete.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(keysToDelete.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startCacheCleanup

**シグネチャ**:
```javascript
 startCacheCleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startCacheCleanup();

// startCacheCleanupの実用的な使用例
const result = instance.startCacheCleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearCache

**シグネチャ**:
```javascript
 clearCache(type = null)
```

**パラメーター**:
- `type = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearCache(type = null);

// clearCacheの実用的な使用例
const result = instance.clearCache(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(type);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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

#### getRegisteredCalculators

**シグネチャ**:
```javascript
 getRegisteredCalculators()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRegisteredCalculators();

// getRegisteredCalculatorsの実用的な使用例
const result = instance.getRegisteredCalculators(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hasCalculator

**シグネチャ**:
```javascript
 hasCalculator(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hasCalculator(type);

// hasCalculatorの実用的な使用例
const result = instance.hasCalculator(/* 適切なパラメータ */);
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

#### if

**シグネチャ**:
```javascript
 if (!cached)
```

**パラメーター**:
- `!cached`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!cached);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now > cached.expiry)
```

**パラメーター**:
- `now > cached.expiry`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now > cached.expiry);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

キャッシュサイズ制限チェック

**シグネチャ**:
```javascript
 while (this.cache.size >= this.cacheConfig.maxSize)
```

**パラメーター**:
- `this.cache.size >= this.cacheConfig.maxSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(this.cache.size >= this.cacheConfig.maxSize);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

重い計算は長時間キャッシュ

**シグネチャ**:
```javascript
 if (calculationTime > this.cacheConfig.heavyCalculationThreshold)
```

**パラメーター**:
- `calculationTime > this.cacheConfig.heavyCalculationThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(calculationTime > this.cacheConfig.heavyCalculationThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (frequency > this.cacheConfig.preloadThreshold)
```

**パラメーター**:
- `frequency > this.cacheConfig.preloadThreshold`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(frequency > this.cacheConfig.preloadThreshold);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (score < lowestScore)
```

**パラメーター**:
- `score < lowestScore`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(score < lowestScore);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (leastValuableKey)
```

**パラメーター**:
- `leastValuableKey`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(leastValuableKey);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

頻度マップのサイズ制限

**シグネチャ**:
```javascript
 if (this.frequentCalculations.size > 1000)
```

**パラメーター**:
- `this.frequentCalculations.size > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.frequentCalculations.size > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### startPerformanceOptimization

**シグネチャ**:
```javascript
 startPerformanceOptimization()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startPerformanceOptimization();

// startPerformanceOptimizationの実用的な使用例
const result = instance.startPerformanceOptimization(/* 適切なパラメータ */);
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

上位50エントリ

**シグネチャ**:
```javascript
 for (const [cacheKey] of frequentEntries)
```

**パラメーター**:
- `const [cacheKey] of frequentEntries`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [cacheKey] of frequentEntries);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ヒット率が低い場合はキャッシュサイズを増加

**シグネチャ**:
```javascript
 if (hitRate < 70 && this.cacheConfig.maxSize < 5000)
```

**パラメーター**:
- `hitRate < 70 && this.cacheConfig.maxSize < 5000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hitRate < 70 && this.cacheConfig.maxSize < 5000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ヒット率が高い場合はTTLを延長

**シグネチャ**:
```javascript
 if (hitRate > 90)
```

**パラメーター**:
- `hitRate > 90`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hitRate > 90);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### enableMemoization

**シグネチャ**:
```javascript
 enableMemoization(type, methods = [])
```

**パラメーター**:
- `type`
- `methods = []`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.enableMemoization(type, methods = []);

// enableMemoizationの実用的な使用例
const result = instance.enableMemoization(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!calculator)
```

**パラメーター**:
- `!calculator`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!calculator);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!calculator._memoized)
```

**パラメーター**:
- `!calculator._memoized`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!calculator._memoized);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const method of targetMethods)
```

**パラメーター**:
- `const method of targetMethods`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const method of targetMethods);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof calculator[method] === 'function')
```

**パラメーター**:
- `typeof calculator[method] === 'function'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof calculator[method] === 'function');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getExtendedCacheStats

**シグネチャ**:
```javascript
 getExtendedCacheStats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getExtendedCacheStats();

// getExtendedCacheStatsの実用的な使用例
const result = instance.getExtendedCacheStats(/* 適切なパラメータ */);
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
 if (batch.timeout)
```

**パラメーター**:
- `batch.timeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(batch.timeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## getCalculationEngine

**シグネチャ**:
```javascript
getCalculationEngine()
```

**使用例**:
```javascript
const result = getCalculationEngine();
```

---

## 定数

| 定数名 | 説明 |
|--------|------|
| `cacheKey` | 説明なし |
| `cachedResult` | 説明なし |
| `calculator` | 説明なし |
| `startTime` | 説明なし |
| `result` | 説明なし |
| `endTime` | 説明なし |
| `calculationTime` | 説明なし |
| `memoKey` | 説明なし |
| `result` | 説明なし |
| `batchKey` | 説明なし |
| `batch` | 説明なし |
| `batch` | 説明なし |
| `calculator` | 説明なし |
| `allParams` | 説明なし |
| `results` | 説明なし |
| `result` | 説明なし |
| `paramString` | 説明なし |
| `cached` | 説明なし |
| `expiry` | 説明なし |
| `now` | 説明なし |
| `keysToDelete` | 説明なし |
| `keysToDelete` | 説明なし |
| `size` | 説明なし |
| `hitRate` | 説明なし |
| `cached` | 説明なし |
| `now` | 説明なし |
| `adaptiveTtl` | 説明なし |
| `now` | 説明なし |
| `frequency` | 説明なし |
| `frequency` | 説明なし |
| `now` | 説明なし |
| `timeSinceLastAccess` | 説明なし |
| `accessFrequency` | 説明なし |
| `calculationCost` | 説明なし |
| `score` | 説明なし |
| `currentCount` | 説明なし |
| `entries` | 説明なし |
| `toDelete` | 説明なし |
| `key` | 説明なし |
| `stats` | 説明なし |
| `frequentEntries` | 説明なし |
| `heavyCalculations` | 説明なし |
| `extensionTime` | 説明なし |
| `stats` | 説明なし |
| `hitRate` | 説明なし |
| `calculator` | 説明なし |
| `targetMethods` | 説明なし |
| `basicStats` | 説明なし |
| `performanceSummary` | 説明なし |
| `frequentCalculations` | 説明なし |

---

