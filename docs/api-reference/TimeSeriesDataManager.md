# TimeSeriesDataManager

## 概要

ファイル: `core/TimeSeriesDataManager.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [TimeSeriesDataManager](#timeseriesdatamanager)
- [DataCompressionManager](#datacompressionmanager)
- [DataArchiveManager](#dataarchivemanager)
## 定数
- [date](#date)
- [dayKey](#daykey)
- [weekKey](#weekkey)
- [monthKey](#monthkey)
- [periodData](#perioddata)
- [categoryData](#categorydata)
- [recent](#recent)
- [older](#older)
- [recentAvg](#recentavg)
- [olderAvg](#olderavg)
- [changePercent](#changepercent)
- [result](#result)
- [periodDate](#perioddate)
- [entry](#entry)
- [timeSeriesData](#timeseriesdata)
- [result](#result)
- [categoryData](#categorydata)
- [data1](#data1)
- [data2](#data2)
- [stats1](#stats1)
- [stats2](#stats2)
- [categoryData](#categorydata)
- [year](#year)
- [week](#week)
- [firstDayOfYear](#firstdayofyear)
- [pastDaysOfYear](#pastdaysofyear)
- [firstDayOfYear](#firstdayofyear)
- [daysToAdd](#daystoadd)
- [now](#now)
- [sortedKeys](#sortedkeys)
- [keysToDelete](#keystodelete)
- [now](#now)
- [data](#data)
- [serializedData](#serializeddata)
- [savedData](#saveddata)
- [data](#data)
- [deserializedData](#deserializeddata)
- [serialized](#serialized)
- [deserialized](#deserialized)
- [categories](#categories)
- [allKeys](#allkeys)
- [oldestKey](#oldestkey)

---

## TimeSeriesDataManager

### コンストラクタ

```javascript
new TimeSeriesDataManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `dailyData` | 説明なし |
| `weeklyData` | 説明なし |
| `monthlyData` | 説明なし |
| `compressionManager` | データ圧縮・アーカイブ |
| `archiveManager` | 説明なし |
| `maxDataPoints` | 設定 |
| `currentPeriodKeys` | 現在の期間キー |
| `saveInterval` | データ保存間隔（ミリ秒） |
| `lastSaveTime` | 5分 |
| `currentPeriodKeys` | 説明なし |
| `lastSaveTime` | 説明なし |
| `dailyData` | 説明なし |
| `weeklyData` | 説明なし |
| `monthlyData` | 説明なし |
| `currentPeriodKeys` | 説明なし |
| `dailyData` | 説明なし |
| `weeklyData` | 説明なし |
| `monthlyData` | 説明なし |
| `currentPeriodKeys` | 説明なし |

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

#### addDataPoint

**シグネチャ**:
```javascript
 addDataPoint(timestamp, category, value, metadata = {})
```

**パラメーター**:
- `timestamp`
- `category`
- `value`
- `metadata = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.addDataPoint(timestamp, category, value, metadata = {});

// addDataPointの実用的な使用例
const result = instance.addDataPoint(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateTimeSeriesData

**シグネチャ**:
```javascript
 updateTimeSeriesData(dataMap, periodKey, category, value, metadata)
```

**パラメーター**:
- `dataMap`
- `periodKey`
- `category`
- `value`
- `metadata`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateTimeSeriesData(dataMap, periodKey, category, value, metadata);

// updateTimeSeriesDataの実用的な使用例
const result = instance.updateTimeSeriesData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

値の数制限

**シグネチャ**:
```javascript
 if (categoryData.values.length > 1000)
```

**パラメーター**:
- `categoryData.values.length > 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(categoryData.values.length > 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateTrend

**シグネチャ**:
```javascript
 calculateTrend(values)
```

**パラメーター**:
- `values`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateTrend(values);

// calculateTrendの実用的な使用例
const result = instance.calculateTrend(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (changePercent > 10)
```

**パラメーター**:
- `changePercent > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changePercent > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (changePercent < -10)
```

**パラメーター**:
- `changePercent < -10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(changePercent < -10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTimeSeriesData

**シグネチャ**:
```javascript
 getTimeSeriesData(period, category = null, startDate = null, endDate = null)
```

**パラメーター**:
- `period`
- `category = null`
- `startDate = null`
- `endDate = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTimeSeriesData(period, category = null, startDate = null, endDate = null);

// getTimeSeriesDataの実用的な使用例
const result = instance.getTimeSeriesData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (period)
```

**パラメーター**:
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(period);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

日付フィルター

**シグネチャ**:
```javascript
 if (startDate || endDate)
```

**パラメーター**:
- `startDate || endDate`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(startDate || endDate);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

カテゴリフィルター

**シグネチャ**:
```javascript
 if (category)
```

**パラメーター**:
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(category);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatCategoryData

**シグネチャ**:
```javascript
 formatCategoryData(categoryData)
```

**パラメーター**:
- `categoryData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatCategoryData(categoryData);

// formatCategoryDataの実用的な使用例
const result = instance.formatCategoryData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAggregatedData

**シグネチャ**:
```javascript
 getAggregatedData(category, period, aggregationType = 'sum')
```

**パラメーター**:
- `category`
- `period`
- `aggregationType = 'sum'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAggregatedData(category, period, aggregationType = 'sum');

// getAggregatedDataの実用的な使用例
const result = instance.getAggregatedData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (aggregationType)
```

**パラメーター**:
- `aggregationType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(aggregationType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### comparePerformance

**シグネチャ**:
```javascript
 comparePerformance(category, period1, period2)
```

**パラメーター**:
- `category`
- `period1`
- `period2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.comparePerformance(category, period1, period2);

// comparePerformanceの実用的な使用例
const result = instance.comparePerformance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePeriodStats

**シグネチャ**:
```javascript
 calculatePeriodStats(data, category)
```

**パラメーター**:
- `data`
- `category`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePeriodStats(data, category);

// calculatePeriodStatsの実用的な使用例
const result = instance.calculatePeriodStats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.length === 0)
```

**パラメーター**:
- `data.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(entry => {
            const categoryData = entry.categories[category];
            if (categoryData)
```

**パラメーター**:
- `entry => {
            const categoryData = entry.categories[category];
            if (categoryData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(entry => {
            const categoryData = entry.categories[category];
            if (categoryData);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDayKey

**シグネチャ**:
```javascript
 getDayKey(date)
```

**パラメーター**:
- `date`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDayKey(date);

// getDayKeyの実用的な使用例
const result = instance.getDayKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getWeekKey

**シグネチャ**:
```javascript
 getWeekKey(date)
```

**パラメーター**:
- `date`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getWeekKey(date);

// getWeekKeyの実用的な使用例
const result = instance.getWeekKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMonthKey

**シグネチャ**:
```javascript
 getMonthKey(date)
```

**パラメーター**:
- `date`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMonthKey(date);

// getMonthKeyの実用的な使用例
const result = instance.getMonthKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getWeekNumber

**シグネチャ**:
```javascript
 getWeekNumber(date)
```

**パラメーター**:
- `date`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getWeekNumber(date);

// getWeekNumberの実用的な使用例
const result = instance.getWeekNumber(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parsePeriodKey

**シグネチャ**:
```javascript
 parsePeriodKey(periodKey, period)
```

**パラメーター**:
- `periodKey`
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parsePeriodKey(periodKey, period);

// parsePeriodKeyの実用的な使用例
const result = instance.parsePeriodKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (period)
```

**パラメーター**:
- `period`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(period);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDateFromWeek

**シグネチャ**:
```javascript
 getDateFromWeek(year, week)
```

**パラメーター**:
- `year`
- `week`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDateFromWeek(year, week);

// getDateFromWeekの実用的な使用例
const result = instance.getDateFromWeek(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDateFromPeriod

**シグネチャ**:
```javascript
 getDateFromPeriod(periodString)
```

**パラメーター**:
- `periodString`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDateFromPeriod(periodString);

// getDateFromPeriodの実用的な使用例
const result = instance.getDateFromPeriod(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateCurrentPeriodKeys

**シグネチャ**:
```javascript
 updateCurrentPeriodKeys()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateCurrentPeriodKeys();

// updateCurrentPeriodKeysの実用的な使用例
const result = instance.updateCurrentPeriodKeys(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupDataCleanup

**シグネチャ**:
```javascript
 setupDataCleanup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupDataCleanup();

// setupDataCleanupの実用的な使用例
const result = instance.setupDataCleanup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupOldData

**シグネチャ**:
```javascript
 cleanupOldData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOldData();

// cleanupOldDataの実用的な使用例
const result = instance.cleanupOldData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### cleanupDataMap

**シグネチャ**:
```javascript
 cleanupDataMap(dataMap, maxPoints)
```

**パラメーター**:
- `dataMap`
- `maxPoints`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupDataMap(dataMap, maxPoints);

// cleanupDataMapの実用的な使用例
const result = instance.cleanupDataMap(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupAutoSave

**シグネチャ**:
```javascript
 setupAutoSave()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupAutoSave();

// setupAutoSaveの実用的な使用例
const result = instance.setupAutoSave(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkAutoSave

**シグネチャ**:
```javascript
 checkAutoSave()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkAutoSave();

// checkAutoSaveの実用的な使用例
const result = instance.checkAutoSave(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (now - this.lastSaveTime >= this.saveInterval)
```

**パラメーター**:
- `now - this.lastSaveTime >= this.saveInterval`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(now - this.lastSaveTime >= this.saveInterval);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### save

**シグネチャ**:
```javascript
 save()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.save();

// saveの実用的な使用例
const result = instance.save(/* 適切なパラメータ */);
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

#### load

**シグネチャ**:
```javascript
 load()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.load();

// loadの実用的な使用例
const result = instance.load(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (savedData)
```

**パラメーター**:
- `savedData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(savedData);

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

#### serializeData

**シグネチャ**:
```javascript
 serializeData(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.serializeData(data);

// serializeDataの実用的な使用例
const result = instance.serializeData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### deserializeData

**シグネチャ**:
```javascript
 deserializeData(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deserializeData(data);

// deserializeDataの実用的な使用例
const result = instance.deserializeData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(period => {
            if (data[period])
```

**パラメーター**:
- `period => {
            if (data[period]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(period => {
            if (data[period]);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
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

#### getStatisticsSummary

**シグネチャ**:
```javascript
 getStatisticsSummary()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatisticsSummary();

// getStatisticsSummaryの実用的な使用例
const result = instance.getStatisticsSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAllCategories

**シグネチャ**:
```javascript
 getAllCategories()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAllCategories();

// getAllCategoriesの実用的な使用例
const result = instance.getAllCategories(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getDateRange

**シグネチャ**:
```javascript
 getDateRange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getDateRange();

// getDateRangeの実用的な使用例
const result = instance.getDateRange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (allKeys.length === 0)
```

**パラメーター**:
- `allKeys.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(allKeys.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## DataCompressionManager

### コンストラクタ

```javascript
new DataCompressionManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `compressionThreshold` | 説明なし |

### メソッド

#### compress

**シグネチャ**:
```javascript
 compress(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compress(data);

// compressの実用的な使用例
const result = instance.compress(/* 適切なパラメータ */);
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

#### decompress

**シグネチャ**:
```javascript
 decompress(compressedData)
```

**パラメーター**:
- `compressedData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.decompress(compressedData);

// decompressの実用的な使用例
const result = instance.decompress(/* 適切なパラメータ */);
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

## DataArchiveManager

### コンストラクタ

```javascript
new DataArchiveManager()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `archiveStorage` | 説明なし |
| `maxArchiveSize` | 説明なし |

### メソッド

#### archiveData

**シグネチャ**:
```javascript
 archiveData(key, data)
```

**パラメーター**:
- `key`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.archiveData(key, data);

// archiveDataの実用的な使用例
const result = instance.archiveData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

アーカイブサイズ制限

**シグネチャ**:
```javascript
 if (this.archiveStorage.size > this.maxArchiveSize)
```

**パラメーター**:
- `this.archiveStorage.size > this.maxArchiveSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.archiveStorage.size > this.maxArchiveSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getArchivedData

**シグネチャ**:
```javascript
 getArchivedData(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getArchivedData(key);

// getArchivedDataの実用的な使用例
const result = instance.getArchivedData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearArchive

**シグネチャ**:
```javascript
 clearArchive()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearArchive();

// clearArchiveの実用的な使用例
const result = instance.clearArchive(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `date` | 説明なし |
| `dayKey` | 説明なし |
| `weekKey` | 説明なし |
| `monthKey` | 説明なし |
| `periodData` | 説明なし |
| `categoryData` | 説明なし |
| `recent` | 説明なし |
| `older` | 説明なし |
| `recentAvg` | 説明なし |
| `olderAvg` | 説明なし |
| `changePercent` | 説明なし |
| `result` | 説明なし |
| `periodDate` | 説明なし |
| `entry` | 説明なし |
| `timeSeriesData` | 説明なし |
| `result` | 説明なし |
| `categoryData` | 説明なし |
| `data1` | 説明なし |
| `data2` | 説明なし |
| `stats1` | 説明なし |
| `stats2` | 説明なし |
| `categoryData` | 説明なし |
| `year` | 説明なし |
| `week` | 説明なし |
| `firstDayOfYear` | 説明なし |
| `pastDaysOfYear` | 説明なし |
| `firstDayOfYear` | 説明なし |
| `daysToAdd` | 説明なし |
| `now` | 説明なし |
| `sortedKeys` | 説明なし |
| `keysToDelete` | 説明なし |
| `now` | 説明なし |
| `data` | 説明なし |
| `serializedData` | 説明なし |
| `savedData` | 説明なし |
| `data` | 説明なし |
| `deserializedData` | 説明なし |
| `serialized` | 説明なし |
| `deserialized` | 説明なし |
| `categories` | 説明なし |
| `allKeys` | 説明なし |
| `oldestKey` | 説明なし |

---

