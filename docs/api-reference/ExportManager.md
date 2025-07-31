# ExportManager

## 概要

ファイル: `core/ExportManager.js`  
最終更新: 2025/7/29 10:26:52

## 目次

## クラス
- [ExportManager](#exportmanager)
- [JSONExporter](#jsonexporter)
- [CompressedExporter](#compressedexporter)
- [EncryptedExporter](#encryptedexporter)
- [CSVExporter](#csvexporter)
- [TextExporter](#textexporter)
## 定数
- [startTime](#starttime)
- [exporter](#exporter)
- [data](#data)
- [validationResult](#validationresult)
- [metadata](#metadata)
- [exportData](#exportdata)
- [dataSize](#datasize)
- [result](#result)
- [endTime](#endtime)
- [duration](#duration)
- [exportData](#exportdata)
- [data](#data)
- [data](#data)
- [dataSize](#datasize)
- [finalFilename](#finalfilename)
- [url](#url)
- [link](#link)
- [timestamp](#timestamp)
- [extension](#extension)
- [extensions](#extensions)
- [mimeTypes](#mimetypes)
- [totalSize](#totalsize)
- [totalTime](#totaltime)
- [keys](#keys)
- [dataTypes](#datatypes)
- [jsonString](#jsonstring)
- [filename](#filename)
- [jsonString](#jsonstring)
- [filename](#filename)
- [jsonString](#jsonstring)
- [encoded](#encoded)
- [filename](#filename)
- [filename](#filename)
- [headers](#headers)
- [rows](#rows)
- [headers](#headers)
- [rows](#rows)
- [headers](#headers)
- [rows](#rows)
- [filename](#filename)
- [spaces](#spaces)

---

## ExportManager

### コンストラクタ

```javascript
new ExportManager(dataStorage, validationManager = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `storage` | 説明なし |
| `validation` | 説明なし |
| `version` | 説明なし |
| `exportFormats` | エクスポート形式 |
| `config` | エクスポート設定 |
| `statistics` | エクスポート統計 |
| `config` | 説明なし |

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

#### registerExportFormats

**シグネチャ**:
```javascript
 registerExportFormats()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerExportFormats();

// registerExportFormatsの実用的な使用例
const result = instance.registerExportFormats(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### exportData

**シグネチャ**:
```javascript
async exportData(dataType = 'all', format = 'json', options = {})
```

**パラメーター**:
- `dataType = 'all'`
- `format = 'json'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.exportData(dataType = 'all', format = 'json', options = {});

// exportDataの実用的な使用例
const result = instance.exportData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!exporter)
```

**パラメーター**:
- `!exporter`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!exporter);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

データの検証

**シグネチャ**:
```javascript
 if (this.config.validateBeforeExport && this.validation)
```

**パラメーター**:
- `this.config.validateBeforeExport && this.validation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.validateBeforeExport && this.validation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!validationResult.isValid)
```

**パラメーター**:
- `!validationResult.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!validationResult.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

警告があっても続行（エラーの場合は例外を投げる）

**シグネチャ**:
```javascript
 if (validationResult.errors.length > 0)
```

**パラメーター**:
- `validationResult.errors.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(validationResult.errors.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataSize > this.config.maxExportSize)
```

**パラメーター**:
- `dataSize > this.config.maxExportSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataSize > this.config.maxExportSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

パフォーマンス要件チェック（< 2000ms）

**シグネチャ**:
```javascript
 if (duration > 2000)
```

**パラメーター**:
- `duration > 2000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(duration > 2000);

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

#### collectExportData

**シグネチャ**:
```javascript
async collectExportData(dataType)
```

**パラメーター**:
- `dataType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectExportData(dataType);

// collectExportDataの実用的な使用例
const result = instance.collectExportData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataType === 'all')
```

**パラメーター**:
- `dataType === 'all'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataType === 'all');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### forEach

**シグネチャ**:
```javascript
 forEach(key => {
                    if (exportData[key] === null || exportData[key] === undefined)
```

**パラメーター**:
- `key => {
                    if (exportData[key] === null || exportData[key] === undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.forEach(key => {
                    if (exportData[key] === null || exportData[key] === undefined);

// forEachの実用的な使用例
const result = instance.forEach(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

複数データタイプのエクスポート

**シグネチャ**:
```javascript
 for (const type of dataType)
```

**パラメーター**:
- `const type of dataType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const type of dataType);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data !== null && data !== undefined)
```

**パラメーター**:
- `data !== null && data !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data !== null && data !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (data !== null && data !== undefined)
```

**パラメーター**:
- `data !== null && data !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(data !== null && data !== undefined);

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

#### createExportMetadata

**シグネチャ**:
```javascript
 createExportMetadata(dataType, data, format, options)
```

**パラメーター**:
- `dataType`
- `data`
- `format`
- `options`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createExportMetadata(dataType, data, format, options);

// createExportMetadataの実用的な使用例
const result = instance.createExportMetadata(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### downloadExport

**シグネチャ**:
```javascript
async downloadExport(exportResult, filename = null)
```

**パラメーター**:
- `exportResult`
- `filename = null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.downloadExport(exportResult, filename = null);

// downloadExportの実用的な使用例
const result = instance.downloadExport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!exportResult.success)
```

**パラメーター**:
- `!exportResult.success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!exportResult.success);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof exportResult.data === 'string')
```

**パラメーター**:
- `typeof exportResult.data === 'string'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof exportResult.data === 'string');

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

#### generateFilename

**シグネチャ**:
```javascript
 generateFilename(dataType, format)
```

**パラメーター**:
- `dataType`
- `format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateFilename(dataType, format);

// generateFilenameの実用的な使用例
const result = instance.generateFilename(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getFileExtension

**シグネチャ**:
```javascript
 getFileExtension(format)
```

**パラメーター**:
- `format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getFileExtension(format);

// getFileExtensionの実用的な使用例
const result = instance.getFileExtension(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMimeType

**シグネチャ**:
```javascript
 getMimeType(format)
```

**パラメーター**:
- `format`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMimeType(format);

// getMimeTypeの実用的な使用例
const result = instance.getMimeType(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getExportHistory

**シグネチャ**:
```javascript
 getExportHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getExportHistory();

// getExportHistoryの実用的な使用例
const result = instance.getExportHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStatistics

**シグネチャ**:
```javascript
 updateStatistics(success, duration, size)
```

**パラメーター**:
- `success`
- `duration`
- `size`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStatistics(success, duration, size);

// updateStatisticsの実用的な使用例
const result = instance.updateStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (success)
```

**パラメーター**:
- `success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(success);

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

#### getAvailableDataTypes

**シグネチャ**:
```javascript
async getAvailableDataTypes()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAvailableDataTypes();

// getAvailableDataTypesの実用的な使用例
const result = instance.getAvailableDataTypes(/* 適切なパラメータ */);
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

## JSONExporter

### コンストラクタ

```javascript
new JSONExporter(exportManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `exportManager` | 説明なし |

### メソッド

#### export

**シグネチャ**:
```javascript
async export(exportData, options = {})
```

**パラメーター**:
- `exportData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.export(exportData, options = {});

// exportの実用的な使用例
const result = instance.export(/* 適切なパラメータ */);
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

## CompressedExporter

### コンストラクタ

```javascript
new CompressedExporter(exportManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `exportManager` | 説明なし |

### メソッド

#### export

**シグネチャ**:
```javascript
async export(exportData, options = {})
```

**パラメーター**:
- `exportData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.export(exportData, options = {});

// exportの実用的な使用例
const result = instance.export(/* 適切なパラメータ */);
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

## EncryptedExporter

### コンストラクタ

```javascript
new EncryptedExporter(exportManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `exportManager` | 説明なし |

### メソッド

#### export

**シグネチャ**:
```javascript
async export(exportData, options = {})
```

**パラメーター**:
- `exportData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.export(exportData, options = {});

// exportの実用的な使用例
const result = instance.export(/* 適切なパラメータ */);
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

## CSVExporter

### コンストラクタ

```javascript
new CSVExporter(exportManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `exportManager` | 説明なし |

### メソッド

#### export

**シグネチャ**:
```javascript
async export(exportData, options = {})
```

**パラメーター**:
- `exportData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.export(exportData, options = {});

// exportの実用的な使用例
const result = instance.export(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

統計データをCSV形式に変換

**シグネチャ**:
```javascript
 if (exportData.userData.statistics)
```

**パラメーター**:
- `exportData.userData.statistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(exportData.userData.statistics);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (exportData.userData.playerData)
```

**パラメーター**:
- `exportData.userData.playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(exportData.userData.playerData);

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

#### statisticsToCSV

**シグネチャ**:
```javascript
 statisticsToCSV(statistics)
```

**パラメーター**:
- `statistics`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.statisticsToCSV(statistics);

// statisticsToCSVの実用的な使用例
const result = instance.statisticsToCSV(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### playerDataToCSV

**シグネチャ**:
```javascript
 playerDataToCSV(playerData)
```

**パラメーター**:
- `playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.playerDataToCSV(playerData);

// playerDataToCSVの実用的な使用例
const result = instance.playerDataToCSV(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### objectToCSV

**シグネチャ**:
```javascript
 objectToCSV(obj)
```

**パラメーター**:
- `obj`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.objectToCSV(obj);

// objectToCSVの実用的な使用例
const result = instance.objectToCSV(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### arrayToCSV

**シグネチャ**:
```javascript
 arrayToCSV(array)
```

**パラメーター**:
- `array`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.arrayToCSV(array);

// arrayToCSVの実用的な使用例
const result = instance.arrayToCSV(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## TextExporter

### コンストラクタ

```javascript
new TextExporter(exportManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `exportManager` | 説明なし |

### メソッド

#### export

**シグネチャ**:
```javascript
async export(exportData, options = {})
```

**パラメーター**:
- `exportData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.export(exportData, options = {});

// exportの実用的な使用例
const result = instance.export(/* 適切なパラメータ */);
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

#### formatAsText

**シグネチャ**:
```javascript
 formatAsText(exportData)
```

**パラメーター**:
- `exportData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.formatAsText(exportData);

// formatAsTextの実用的な使用例
const result = instance.formatAsText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof data === 'object')
```

**パラメーター**:
- `typeof data === 'object'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof data === 'object');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### objectToText

**シグネチャ**:
```javascript
 objectToText(obj, indent = 0)
```

**パラメーター**:
- `obj`
- `indent = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.objectToText(obj, indent = 0);

// objectToTextの実用的な使用例
const result = instance.objectToText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof value === 'object' && value !== null)
```

**パラメーター**:
- `typeof value === 'object' && value !== null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof value === 'object' && value !== null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `exporter` | 説明なし |
| `data` | 説明なし |
| `validationResult` | 説明なし |
| `metadata` | 説明なし |
| `exportData` | 説明なし |
| `dataSize` | 説明なし |
| `result` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `exportData` | 説明なし |
| `data` | 説明なし |
| `data` | 説明なし |
| `dataSize` | 説明なし |
| `finalFilename` | 説明なし |
| `url` | 説明なし |
| `link` | 説明なし |
| `timestamp` | 説明なし |
| `extension` | 説明なし |
| `extensions` | 説明なし |
| `mimeTypes` | 説明なし |
| `totalSize` | 説明なし |
| `totalTime` | 説明なし |
| `keys` | 説明なし |
| `dataTypes` | 説明なし |
| `jsonString` | 説明なし |
| `filename` | 説明なし |
| `jsonString` | 説明なし |
| `filename` | 説明なし |
| `jsonString` | 説明なし |
| `encoded` | 説明なし |
| `filename` | 説明なし |
| `filename` | 説明なし |
| `headers` | 説明なし |
| `rows` | 説明なし |
| `headers` | 説明なし |
| `rows` | 説明なし |
| `headers` | 説明なし |
| `rows` | 説明なし |
| `filename` | 説明なし |
| `spaces` | 説明なし |

---

