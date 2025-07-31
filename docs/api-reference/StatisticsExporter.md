# StatisticsExporter

## 概要

ファイル: `core/StatisticsExporter.js`  
最終更新: 2025/7/28 16:45:38

## 目次

## クラス
- [StatisticsExporter](#statisticsexporter)
## 定数
- [mergedOptions](#mergedoptions)
- [statisticsData](#statisticsdata)
- [jsonData](#jsondata)
- [sanitizedData](#sanitizeddata)
- [jsonString](#jsonstring)
- [exportResult](#exportresult)
- [mergedOptions](#mergedoptions)
- [statisticsData](#statisticsdata)
- [csvSections](#csvsections)
- [csvString](#csvstring)
- [exportResult](#exportresult)
- [mergedOptions](#mergedoptions)
- [statisticsData](#statisticsdata)
- [textSections](#textsections)
- [textString](#textstring)
- [exportResult](#exportresult)
- [mergedOptions](#mergedoptions)
- [mergeResult](#mergeresult)
- [importResult](#importresult)
- [data](#data)
- [detailedStats](#detailedstats)
- [timeSeriesData](#timeseriesdata)
- [endDate](#enddate)
- [startDate](#startdate)
- [filteredData](#filtereddata)
- [sanitized](#sanitized)
- [lines](#lines)
- [headers](#headers)
- [values](#values)
- [lines](#lines)
- [row](#row)
- [lines](#lines)
- [lines](#lines)
- [sections](#sections)
- [lines](#lines)
- [formattedKey](#formattedkey)
- [formattedValue](#formattedvalue)
- [timestamp](#timestamp)
- [prefix](#prefix)
- [data](#data)
- [lines](#lines)
- [data](#data)
- [backupData](#backupdata)
- [backupId](#backupid)
- [hours](#hours)
- [minutes](#minutes)

---

## StatisticsExporter

### コンストラクタ

```javascript
new StatisticsExporter(statisticsManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `statisticsManager` | 説明なし |
| `exportConfig` | エクスポート設定 |
| `privacySettings` | プライバシー設定 |
| `transformSettings` | データ変換設定 |
| `importConfig` | インポート設定 |
| `exportState` | エクスポート状態 |
| `validationSchema` | データ検証スキーマ |

### メソッド

#### exportToJSON

**シグネチャ**:
```javascript
async exportToJSON(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportToJSON(options = {});

// exportToJSONの実用的な使用例
const result = instance.exportToJSON(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ファイルサイズチェック

**シグネチャ**:
```javascript
 if (jsonString.length > mergedOptions.maxFileSize)
```

**パラメーター**:
- `jsonString.length > mergedOptions.maxFileSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(jsonString.length > mergedOptions.maxFileSize);

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

#### exportToCSV

**シグネチャ**:
```javascript
async exportToCSV(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportToCSV(options = {});

// exportToCSVの実用的な使用例
const result = instance.exportToCSV(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本統計セクション

**シグネチャ**:
```javascript
 if (statisticsData.gamePlayStats)
```

**パラメーター**:
- `statisticsData.gamePlayStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(statisticsData.gamePlayStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スコア統計セクション

**シグネチャ**:
```javascript
 if (statisticsData.scoreStats)
```

**パラメーター**:
- `statisticsData.scoreStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(statisticsData.scoreStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バブル統計セクション

**シグネチャ**:
```javascript
 if (statisticsData.bubbleStats)
```

**パラメーター**:
- `statisticsData.bubbleStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(statisticsData.bubbleStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

コンボ統計セクション

**シグネチャ**:
```javascript
 if (statisticsData.comboStats)
```

**パラメーター**:
- `statisticsData.comboStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(statisticsData.comboStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時系列データセクション

**シグネチャ**:
```javascript
 if (statisticsData.timeSeriesData)
```

**パラメーター**:
- `statisticsData.timeSeriesData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(statisticsData.timeSeriesData);

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

#### exportToText

**シグネチャ**:
```javascript
async exportToText(options = {})
```

**パラメーター**:
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportToText(options = {});

// exportToTextの実用的な使用例
const result = instance.exportToText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

メタデータ

**シグネチャ**:
```javascript
 if (mergedOptions.includeMetadata)
```

**パラメーター**:
- `mergedOptions.includeMetadata`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mergedOptions.includeMetadata);

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

#### importData

**シグネチャ**:
```javascript
async importData(data, format, options = {})
```

**パラメーター**:
- `data`
- `format`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.importData(data, format, options = {});

// importDataの実用的な使用例
const result = instance.importData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (mergedOptions.backupBeforeImport)
```

**パラメーター**:
- `mergedOptions.backupBeforeImport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mergedOptions.backupBeforeImport);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

データの検証

**シグネチャ**:
```javascript
 if (mergedOptions.validateSchema)
```

**パラメーター**:
- `mergedOptions.validateSchema`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mergedOptions.validateSchema);

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

エラー時はバックアップから復元

**シグネチャ**:
```javascript
 if (mergedOptions.backupBeforeImport && backupData)
```

**パラメーター**:
- `mergedOptions.backupBeforeImport && backupData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(mergedOptions.backupBeforeImport && backupData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectStatisticsData

**シグネチャ**:
```javascript
async collectStatisticsData(options)
```

**パラメーター**:
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectStatisticsData(options);

// collectStatisticsDataの実用的な使用例
const result = instance.collectStatisticsData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本統計の取得

**シグネチャ**:
```javascript
 if (this.statisticsManager.getDetailedStatistics)
```

**パラメーター**:
- `this.statisticsManager.getDetailedStatistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsManager.getDetailedStatistics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

時系列データの取得

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

#### if

セッションデータの取得

**シグネチャ**:
```javascript
 if (this.statisticsManager.getSessionHistory)
```

**パラメーター**:
- `this.statisticsManager.getSessionHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.statisticsManager.getSessionHistory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### collectTimeSeriesData

**シグネチャ**:
```javascript
async collectTimeSeriesData()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectTimeSeriesData();

// collectTimeSeriesDataの実用的な使用例
const result = instance.collectTimeSeriesData(/* 適切なパラメータ */);
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

#### applyPrivacyFilters

**シグネチャ**:
```javascript
 applyPrivacyFilters(data, options)
```

**パラメーター**:
- `data`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyPrivacyFilters(data, options);

// applyPrivacyFiltersの実用的な使用例
const result = instance.applyPrivacyFilters(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.privacySettings.excludePersonalInfo)
```

**パラメーター**:
- `!this.privacySettings.excludePersonalInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.privacySettings.excludePersonalInfo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

個人情報の除去

**シグネチャ**:
```javascript
 if (this.privacySettings.anonymizeUserData)
```

**パラメーター**:
- `this.privacySettings.anonymizeUserData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.privacySettings.anonymizeUserData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

IPアドレスの除去

**シグネチャ**:
```javascript
 if (this.privacySettings.excludeIpAddresses)
```

**パラメーター**:
- `this.privacySettings.excludeIpAddresses`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.privacySettings.excludeIpAddresses);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デバイス情報の除去

**シグネチャ**:
```javascript
 if (this.privacySettings.excludeDeviceInfo)
```

**パラメーター**:
- `this.privacySettings.excludeDeviceInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.privacySettings.excludeDeviceInfo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### sanitizeData

**シグネチャ**:
```javascript
 sanitizeData(data, options)
```

**パラメーター**:
- `data`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.sanitizeData(data, options);

// sanitizeDataの実用的な使用例
const result = instance.sanitizeData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Deep copy

**シグネチャ**:
```javascript
 if (this.transformSettings.roundNumbers)
```

**パラメーター**:
- `this.transformSettings.roundNumbers`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.transformSettings.roundNumbers);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.transformSettings.normalizeTimestamps)
```

**パラメーター**:
- `this.transformSettings.normalizeTimestamps`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.transformSettings.normalizeTimestamps);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCSVSection

**シグネチャ**:
```javascript
 generateCSVSection(title, data)
```

**パラメーター**:
- `title`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCSVSection(title, data);

// generateCSVSectionの実用的な使用例
const result = instance.generateCSVSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof data === 'object' && data !== null)
```

**パラメーター**:
- `typeof data === 'object' && data !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof data === 'object' && data !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTimeSeriesCSV

**シグネチャ**:
```javascript
 generateTimeSeriesCSV(timeSeriesData)
```

**パラメーター**:
- `timeSeriesData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTimeSeriesCSV(timeSeriesData);

// generateTimeSeriesCSVの実用的な使用例
const result = instance.generateTimeSeriesCSV(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

日別データ

**シグネチャ**:
```javascript
 if (timeSeriesData.daily && timeSeriesData.daily.length > 0)
```

**パラメーター**:
- `timeSeriesData.daily && timeSeriesData.daily.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(timeSeriesData.daily && timeSeriesData.daily.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTextHeader

**シグネチャ**:
```javascript
 generateTextHeader(options)
```

**パラメーター**:
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTextHeader(options);

// generateTextHeaderの実用的な使用例
const result = instance.generateTextHeader(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTextSummary

**シグネチャ**:
```javascript
 generateTextSummary(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTextSummary(data);

// generateTextSummaryの実用的な使用例
const result = instance.generateTextSummary(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.gamePlayStats)
```

**パラメーター**:
- `data.gamePlayStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.gamePlayStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.scoreStats)
```

**パラメーター**:
- `data.scoreStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.scoreStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.bubbleStats)
```

**パラメーター**:
- `data.bubbleStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.bubbleStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateDetailedTextReport

**シグネチャ**:
```javascript
 generateDetailedTextReport(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateDetailedTextReport(data);

// generateDetailedTextReportの実用的な使用例
const result = instance.generateDetailedTextReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームプレイ統計

**シグネチャ**:
```javascript
 if (data.gamePlayStats)
```

**パラメーター**:
- `data.gamePlayStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.gamePlayStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

スコア統計

**シグネチャ**:
```javascript
 if (data.scoreStats)
```

**パラメーター**:
- `data.scoreStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.scoreStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バブル統計

**シグネチャ**:
```javascript
 if (data.bubbleStats)
```

**パラメーター**:
- `data.bubbleStats`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.bubbleStats);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateTextSection

**シグネチャ**:
```javascript
 generateTextSection(title, data)
```

**パラメーター**:
- `title`
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateTextSection(title, data);

// generateTextSectionの実用的な使用例
const result = instance.generateTextSection(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateMetadata

**シグネチャ**:
```javascript
 generateMetadata(options)
```

**パラメーター**:
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateMetadata(options);

// generateMetadataの実用的な使用例
const result = instance.generateMetadata(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateFilename

**シグネチャ**:
```javascript
 generateFilename(format, options)
```

**パラメーター**:
- `format`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateFilename(format, options);

// generateFilenameの実用的な使用例
const result = instance.generateFilename(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### countRecords

**シグネチャ**:
```javascript
 countRecords(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.countRecords(data);

// countRecordsの実用的な使用例
const result = instance.countRecords(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data.timeSeriesData)
```

**パラメーター**:
- `data.timeSeriesData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data.timeSeriesData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parseJSONData

**シグネチャ**:
```javascript
 parseJSONData(jsonString)
```

**パラメーター**:
- `jsonString`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseJSONData(jsonString);

// parseJSONDataの実用的な使用例
const result = instance.parseJSONData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本構造の検証

**シグネチャ**:
```javascript
 if (!data.statistics)
```

**パラメーター**:
- `!data.statistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!data.statistics);

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

#### parseCSVData

**シグネチャ**:
```javascript
 parseCSVData(csvString)
```

**パラメーター**:
- `csvString`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseCSVData(csvString);

// parseCSVDataの実用的な使用例
const result = instance.parseCSVData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### validateImportData

**シグネチャ**:
```javascript
 validateImportData(data)
```

**パラメーター**:
- `data`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateImportData(data);

// validateImportDataの実用的な使用例
const result = instance.validateImportData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createBackup

**シグネチャ**:
```javascript
async createBackup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createBackup();

// createBackupの実用的な使用例
const result = instance.createBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### createValidationSchema

**シグネチャ**:
```javascript
 createValidationSchema()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createValidationSchema();

// createValidationSchemaの実用的な使用例
const result = instance.createValidationSchema(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### recordExportHistory

**シグネチャ**:
```javascript
 recordExportHistory(result)
```

**パラメーター**:
- `result`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.recordExportHistory(result);

// recordExportHistoryの実用的な使用例
const result = instance.recordExportHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴の制限（最新20件まで）

**シグネチャ**:
```javascript
 if (this.exportState.exportHistory.length > 20)
```

**パラメーター**:
- `this.exportState.exportHistory.length > 20`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.exportState.exportHistory.length > 20);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatCSVValue

**シグネチャ**:
```javascript
 formatCSVValue(value)
```

**パラメーター**:
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatCSVValue(value);

// formatCSVValueの実用的な使用例
const result = instance.formatCSVValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatTime

**シグネチャ**:
```javascript
 formatTime(seconds)
```

**パラメーター**:
- `seconds`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatTime(seconds);

// formatTimeの実用的な使用例
const result = instance.formatTime(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hours > 0)
```

**パラメーター**:
- `hours > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hours > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### formatValue

**シグネチャ**:
```javascript
 formatValue(value)
```

**パラメーター**:
- `value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatValue(value);

// formatValueの実用的な使用例
const result = instance.formatValue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'number')
```

**パラメーター**:
- `typeof value === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### humanizeKey

**シグネチャ**:
```javascript
 humanizeKey(key)
```

**パラメーター**:
- `key`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.humanizeKey(key);

// humanizeKeyの実用的な使用例
const result = instance.humanizeKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### removeField

**シグネチャ**:
```javascript
 removeField(obj, fieldName)
```

**パラメーター**:
- `obj`
- `fieldName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.removeField(obj, fieldName);

// removeFieldの実用的な使用例
const result = instance.removeField(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof obj === 'object' && obj !== null)
```

**パラメーター**:
- `typeof obj === 'object' && obj !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof obj === 'object' && obj !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(value => {
                if (typeof value === 'object')
```

**パラメーター**:
- `value => {
                if (typeof value === 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(value => {
                if (typeof value === 'object');

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### roundNumbersInObject

**シグネチャ**:
```javascript
 roundNumbersInObject(obj, decimals)
```

**パラメーター**:
- `obj`
- `decimals`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.roundNumbersInObject(obj, decimals);

// roundNumbersInObjectの実用的な使用例
const result = instance.roundNumbersInObject(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(key => {
            if (typeof obj[key] === 'number')
```

**パラメーター**:
- `key => {
            if (typeof obj[key] === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(key => {
            if (typeof obj[key] === 'number');

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof obj[key] === 'object' && obj[key] !== null)
```

**パラメーター**:
- `typeof obj[key] === 'object' && obj[key] !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof obj[key] === 'object' && obj[key] !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### normalizeTimestamps

**シグネチャ**:
```javascript
 normalizeTimestamps(obj)
```

**パラメーター**:
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.normalizeTimestamps(obj);

// normalizeTimestampsの実用的な使用例
const result = instance.normalizeTimestamps(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof obj[key] === 'number')
```

**パラメーター**:
- `typeof obj[key] === 'number'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof obj[key] === 'number');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof obj[key] === 'object' && obj[key] !== null)
```

**パラメーター**:
- `typeof obj[key] === 'object' && obj[key] !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof obj[key] === 'object' && obj[key] !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getExportState

**シグネチャ**:
```javascript
 getExportState()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getExportState();

// getExportStateの実用的な使用例
const result = instance.getExportState(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateSettings

**シグネチャ**:
```javascript
 updateSettings(settings)
```

**パラメーター**:
- `settings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateSettings(settings);

// updateSettingsの実用的な使用例
const result = instance.updateSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.export)
```

**パラメーター**:
- `settings.export`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.export);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.privacy)
```

**パラメーター**:
- `settings.privacy`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.privacy);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (settings.import)
```

**パラメーター**:
- `settings.import`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(settings.import);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `mergedOptions` | 説明なし |
| `statisticsData` | 説明なし |
| `jsonData` | 説明なし |
| `sanitizedData` | 説明なし |
| `jsonString` | 説明なし |
| `exportResult` | 説明なし |
| `mergedOptions` | 説明なし |
| `statisticsData` | 説明なし |
| `csvSections` | 説明なし |
| `csvString` | 説明なし |
| `exportResult` | 説明なし |
| `mergedOptions` | 説明なし |
| `statisticsData` | 説明なし |
| `textSections` | 説明なし |
| `textString` | 説明なし |
| `exportResult` | 説明なし |
| `mergedOptions` | 説明なし |
| `mergeResult` | 説明なし |
| `importResult` | 説明なし |
| `data` | 説明なし |
| `detailedStats` | 説明なし |
| `timeSeriesData` | 説明なし |
| `endDate` | 説明なし |
| `startDate` | 説明なし |
| `filteredData` | 説明なし |
| `sanitized` | 説明なし |
| `lines` | 説明なし |
| `headers` | 説明なし |
| `values` | 説明なし |
| `lines` | 説明なし |
| `row` | 説明なし |
| `lines` | 説明なし |
| `lines` | 説明なし |
| `sections` | 説明なし |
| `lines` | 説明なし |
| `formattedKey` | 説明なし |
| `formattedValue` | 説明なし |
| `timestamp` | 説明なし |
| `prefix` | 説明なし |
| `data` | 説明なし |
| `lines` | 説明なし |
| `data` | 説明なし |
| `backupData` | 説明なし |
| `backupId` | 説明なし |
| `hours` | 説明なし |
| `minutes` | 説明なし |

---

