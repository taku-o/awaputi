# StatisticsFilterManager

## 概要

ファイル: `core/StatisticsFilterManager.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [StatisticsFilterManager](#statisticsfiltermanager)
## 定数
- [validSortFields](#validsortfields)
- [validSortOrders](#validsortorders)
- [cacheKey](#cachekey)
- [dateRange](#daterange)
- [rawStats](#rawstats)
- [timeSeriesData](#timeseriesdata)
- [filteredStats](#filteredstats)
- [sortedStats](#sortedstats)
- [result](#result)
- [now](#now)
- [period](#period)
- [start](#start)
- [end](#end)
- [start](#start)
- [end](#end)
- [start](#start)
- [dayOfWeek](#dayofweek)
- [start](#start)
- [start](#start)
- [start](#start)
- [dailyData](#dailydata)
- [weeklyData](#weeklydata)
- [filteredStats](#filteredstats)
- [sessionDate](#sessiondate)
- [sortedStats](#sortedstats)
- [sessions](#sessions)
- [totalScore](#totalscore)
- [totalPlayTime](#totalplaytime)
- [avgAccuracy](#avgaccuracy)
- [maxCombo](#maxcombo)
- [customDates](#customdates)
- [handlers](#handlers)
- [index](#index)
- [handlers](#handlers)

---

## StatisticsFilterManager

### コンストラクタ

```javascript
new StatisticsFilterManager(statisticsManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `statisticsManager` | 説明なし |
| `filterPeriods` | フィルター期間の定義 |
| `currentFilter` | 現在のフィルター設定 |
| `filterState` | フィルター適用状態 |
| `eventHandlers` | イベントハンドラ |
| `currentFilter` | 説明なし |

### メソッド

#### setPeriod

**シグネチャ**:
```javascript
 setPeriod(period, customStart = null, customEnd = null)
```

**パラメーター**:
- `period`
- `customStart = null`
- `customEnd = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setPeriod(period, customStart = null, customEnd = null);

// setPeriodの実用的な使用例
const result = instance.setPeriod(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.filterPeriods[period] && period !== 'custom')
```

**パラメーター**:
- `!this.filterPeriods[period] && period !== 'custom'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.filterPeriods[period] && period !== 'custom');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (period === 'custom')
```

**パラメーター**:
- `period === 'custom'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(period === 'custom');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!customStart || !customEnd)
```

**パラメーター**:
- `!customStart || !customEnd`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!customStart || !customEnd);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setCategories

**シグネチャ**:
```javascript
 setCategories(categories)
```

**パラメーター**:
- `categories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setCategories(categories);

// setCategoriesの実用的な使用例
const result = instance.setCategories(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setSorting

**シグネチャ**:
```javascript
 setSorting(sortBy, sortOrder = 'desc')
```

**パラメーター**:
- `sortBy`
- `sortOrder = 'desc'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setSorting(sortBy, sortOrder = 'desc');

// setSortingの実用的な使用例
const result = instance.setSorting(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFilteredStatistics

**シグネチャ**:
```javascript
async getFilteredStatistics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFilteredStatistics();

// getFilteredStatisticsの実用的な使用例
const result = instance.getFilteredStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.filterState.isApplying)
```

**パラメーター**:
- `this.filterState.isApplying`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.filterState.isApplying);

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

#### calculateDateRange

**シグネチャ**:
```javascript
 calculateDateRange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateDateRange();

// calculateDateRangeの実用的な使用例
const result = instance.calculateDateRange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'custom')
```

**パラメーター**:
- `this.currentFilter.period === 'custom'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'custom');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'allTime')
```

**パラメーター**:
- `this.currentFilter.period === 'allTime'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'allTime');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'today')
```

**パラメーター**:
- `this.currentFilter.period === 'today'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'today');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'yesterday')
```

**パラメーター**:
- `this.currentFilter.period === 'yesterday'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'yesterday');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'thisWeek')
```

**パラメーター**:
- `this.currentFilter.period === 'thisWeek'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'thisWeek');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'thisMonth')
```

**パラメーター**:
- `this.currentFilter.period === 'thisMonth'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'thisMonth');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.period === 'thisYear')
```

**パラメーター**:
- `this.currentFilter.period === 'thisYear'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.period === 'thisYear');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTimeSeriesData

**シグネチャ**:
```javascript
async getTimeSeriesData(dateRange)
```

**パラメーター**:
- `dateRange`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTimeSeriesData(dateRange);

// getTimeSeriesDataの実用的な使用例
const result = instance.getTimeSeriesData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

StatisticsManagerから時系列データを取得

**シグネチャ**:
```javascript
 if (this.statisticsManager.timeSeriesDataManager)
```

**パラメーター**:
- `this.statisticsManager.timeSeriesDataManager`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsManager.timeSeriesDataManager);

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

#### applyFilters

**シグネチャ**:
```javascript
 applyFilters(rawStats, timeSeriesData, dateRange)
```

**パラメーター**:
- `rawStats`
- `timeSeriesData`
- `dateRange`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyFilters(rawStats, timeSeriesData, dateRange);

// applyFiltersの実用的な使用例
const result = instance.applyFilters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

日付範囲フィルター

**シグネチャ**:
```javascript
 if (timeSeriesData.daily.length > 0)
```

**パラメーター**:
- `timeSeriesData.daily.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeSeriesData.daily.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filterByDateRange

**シグネチャ**:
```javascript
 filterByDateRange(stats, dateRange, timeSeriesData)
```

**パラメーター**:
- `stats`
- `dateRange`
- `timeSeriesData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filterByDateRange(stats, dateRange, timeSeriesData);

// filterByDateRangeの実用的な使用例
const result = instance.filterByDateRange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

各統計項目を期間でフィルタリング

**シグネチャ**:
```javascript
 if (stats.sessions)
```

**パラメーター**:
- `stats.sessions`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stats.sessions);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時系列データから集計値を再計算

**シグネチャ**:
```javascript
 if (timeSeriesData.daily.length > 0)
```

**パラメーター**:
- `timeSeriesData.daily.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeSeriesData.daily.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### filterByCategories

**シグネチャ**:
```javascript
 filterByCategories(stats, categories)
```

**パラメーター**:
- `stats`
- `categories`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.filterByCategories(stats, categories);

// filterByCategoriesの実用的な使用例
const result = instance.filterByCategories(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applySorting

**シグネチャ**:
```javascript
 applySorting(stats)
```

**パラメーター**:
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applySorting(stats);

// applySortingの実用的な使用例
const result = instance.applySorting(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (this.currentFilter.sortBy)
```

**パラメーター**:
- `this.currentFilter.sortBy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(this.currentFilter.sortBy);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.currentFilter.sortOrder === 'asc')
```

**パラメーター**:
- `this.currentFilter.sortOrder === 'asc'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.currentFilter.sortOrder === 'asc');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculatePeriodSummary

**シグネチャ**:
```javascript
 calculatePeriodSummary(dailyData)
```

**パラメーター**:
- `dailyData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculatePeriodSummary(dailyData);

// calculatePeriodSummaryの実用的な使用例
const result = instance.calculatePeriodSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateSummary

**シグネチャ**:
```javascript
 generateSummary(stats)
```

**パラメーター**:
- `stats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateSummary(stats);

// generateSummaryの実用的な使用例
const result = instance.generateSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (sessions.length === 0)
```

**パラメーター**:
- `sessions.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(sessions.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCacheKey

**シグネチャ**:
```javascript
 generateCacheKey()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCacheKey();

// generateCacheKeyの実用的な使用例
const result = instance.generateCacheKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### clearCache

**シグネチャ**:
```javascript
 clearCache()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.clearCache();

// clearCacheの実用的な使用例
const result = instance.clearCache(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resetFilters

**シグネチャ**:
```javascript
 resetFilters()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resetFilters();

// resetFiltersの実用的な使用例
const result = instance.resetFilters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getCurrentFilter

**シグネチャ**:
```javascript
 getCurrentFilter()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getCurrentFilter();

// getCurrentFilterの実用的な使用例
const result = instance.getCurrentFilter(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAvailablePeriods

**シグネチャ**:
```javascript
 getAvailablePeriods()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailablePeriods();

// getAvailablePeriodsの実用的な使用例
const result = instance.getAvailablePeriods(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### on

**シグネチャ**:
```javascript
 on(eventName, handler)
```

**パラメーター**:
- `eventName`
- `handler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.on(eventName, handler);

// onの実用的な使用例
const result = instance.on(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### off

**シグネチャ**:
```javascript
 off(eventName, handler)
```

**パラメーター**:
- `eventName`
- `handler`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.off(eventName, handler);

// offの実用的な使用例
const result = instance.off(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (handlers)
```

**パラメーター**:
- `handlers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(handlers);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
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
 emit(eventName, data)
```

**パラメーター**:
- `eventName`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.emit(eventName, data);

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

## 定数

| 定数名 | 説明 |
|--------|------|
| `validSortFields` | 説明なし |
| `validSortOrders` | 説明なし |
| `cacheKey` | 説明なし |
| `dateRange` | 説明なし |
| `rawStats` | 説明なし |
| `timeSeriesData` | 説明なし |
| `filteredStats` | 説明なし |
| `sortedStats` | 説明なし |
| `result` | 説明なし |
| `now` | 説明なし |
| `period` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `start` | 説明なし |
| `end` | 説明なし |
| `start` | 説明なし |
| `dayOfWeek` | 説明なし |
| `start` | 説明なし |
| `start` | 説明なし |
| `start` | 説明なし |
| `dailyData` | 説明なし |
| `weeklyData` | 説明なし |
| `filteredStats` | 説明なし |
| `sessionDate` | 説明なし |
| `sortedStats` | 説明なし |
| `sessions` | 説明なし |
| `totalScore` | 説明なし |
| `totalPlayTime` | 説明なし |
| `avgAccuracy` | 説明なし |
| `maxCombo` | 説明なし |
| `customDates` | 説明なし |
| `handlers` | 説明なし |
| `index` | 説明なし |
| `handlers` | 説明なし |

---

