# ImportManager

## 概要

ファイル: `core/ImportManager.js`  
最終更新: 2025/7/29 10:26:52

## 目次

## クラス
- [ImportManager](#importmanager)
- [FormatValidator](#formatvalidator)
- [VersionValidator](#versionvalidator)
- [IntegrityValidator](#integrityvalidator)
- [SizeValidator](#sizevalidator)
- [MergeResolver](#mergeresolver)
- [OverwriteResolver](#overwriteresolver)
- [KeepResolver](#keepresolver)
- [SelectiveResolver](#selectiveresolver)
## 定数
- [startTime](#starttime)
- [validationResult](#validationresult)
- [backupResult](#backupresult)
- [conflicts](#conflicts)
- [resolvedData](#resolveddata)
- [importResult](#importresult)
- [endTime](#endtime)
- [duration](#duration)
- [validationResults](#validationresults)
- [errors](#errors)
- [warnings](#warnings)
- [result](#result)
- [conflicts](#conflicts)
- [userData](#userdata)
- [existingData](#existingdata)
- [dataConflicts](#dataconflicts)
- [conflicts](#conflicts)
- [conflicts](#conflicts)
- [criticalFields](#criticalfields)
- [conflicts](#conflicts)
- [conflicts](#conflicts)
- [numericFields](#numericfields)
- [conflicts](#conflicts)
- [existingStr](#existingstr)
- [importedStr](#importedstr)
- [resolver](#resolver)
- [results](#results)
- [userData](#userdata)
- [validationResult](#validationresult)
- [validationResult](#validationresult)
- [conflicts](#conflicts)
- [resolver](#resolver)
- [resolutionPreview](#resolutionpreview)
- [userData](#userdata)
- [dataTypes](#datatypes)
- [dataSize](#datasize)
- [warnings](#warnings)
- [criticalConflicts](#criticalconflicts)
- [currentVersion](#currentversion)
- [totalTime](#totaltime)
- [errors](#errors)
- [warnings](#warnings)
- [errors](#errors)
- [warnings](#warnings)
- [currentVersion](#currentversion)
- [importVersion](#importversion)
- [importMajor](#importmajor)
- [currentMajor](#currentmajor)
- [errors](#errors)
- [warnings](#warnings)
- [userData](#userdata)
- [validationResult](#validationresult)
- [errors](#errors)
- [warnings](#warnings)
- [dataSize](#datasize)
- [userData](#userdata)
- [resolvedData](#resolveddata)
- [mergedData](#mergeddata)
- [actions](#actions)
- [merged](#merged)
- [merged](#merged)
- [merged](#merged)
- [numericFields](#numericfields)
- [actions](#actions)
- [userData](#userdata)
- [resolvedData](#resolveddata)
- [actions](#actions)
- [selections](#selections)
- [userData](#userdata)
- [resolvedData](#resolveddata)
- [selection](#selection)
- [merged](#merged)
- [actions](#actions)

---

## ImportManager

### コンストラクタ

```javascript
new ImportManager(dataStorage, validationManager = null, backupManager = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `storage` | 説明なし |
| `validation` | 説明なし |
| `backup` | 説明なし |
| `version` | 説明なし |
| `importValidators` | インポート検証ルール |
| `conflictResolvers` | 競合解決ストラテジー |
| `config` | インポート設定 |
| `statistics` | インポート統計 |
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

#### registerImportValidators

**シグネチャ**:
```javascript
 registerImportValidators()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerImportValidators();

// registerImportValidatorsの実用的な使用例
const result = instance.registerImportValidators(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### registerConflictResolvers

**シグネチャ**:
```javascript
 registerConflictResolvers()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.registerConflictResolvers();

// registerConflictResolversの実用的な使用例
const result = instance.registerConflictResolvers(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### importData

**シグネチャ**:
```javascript
async importData(importData, conflictResolution = 'merge', options = {})
```

**パラメーター**:
- `importData`
- `conflictResolution = 'merge'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.importData(importData, conflictResolution = 'merge', options = {});

// importDataの実用的な使用例
const result = instance.importData(/* 適切なパラメータ */);
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

バックアップの作成（設定されている場合）

**シグネチャ**:
```javascript
 if (this.config.createBackupBeforeImport && this.backup)
```

**パラメーター**:
- `this.config.createBackupBeforeImport && this.backup`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.createBackupBeforeImport && this.backup);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!backupResult.success)
```

**パラメーター**:
- `!backupResult.success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!backupResult.success);

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

#### validateImportData

**シグネチャ**:
```javascript
async validateImportData(importData)
```

**パラメーター**:
- `importData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validateImportData(importData);

// validateImportDataの実用的な使用例
const result = instance.validateImportData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

各検証ルールの実行

**シグネチャ**:
```javascript
 for (const [name, validator] of this.importValidators)
```

**パラメーター**:
- `const [name`
- `validator] of this.importValidators`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [name, validator] of this.importValidators);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!result.isValid)
```

**パラメーター**:
- `!result.isValid`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!result.isValid);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result.warnings)
```

**パラメーター**:
- `result.warnings`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result.warnings);

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

#### detectConflicts

**シグネチャ**:
```javascript
async detectConflicts(importData)
```

**パラメーター**:
- `importData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.detectConflicts(importData);

// detectConflictsの実用的な使用例
const result = instance.detectConflicts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existingData)
```

**パラメーター**:
- `existingData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existingData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataConflicts.length > 0)
```

**パラメーター**:
- `dataConflicts.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataConflicts.length > 0);

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

#### compareData

**シグネチャ**:
```javascript
 compareData(dataType, existingData, newData)
```

**パラメーター**:
- `dataType`
- `existingData`
- `newData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareData(dataType, existingData, newData);

// compareDataの実用的な使用例
const result = instance.compareData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (dataType)
```

**パラメーター**:
- `dataType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(dataType);

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

#### comparePlayerData

**シグネチャ**:
```javascript
 comparePlayerData(existing, imported)
```

**パラメーター**:
- `existing`
- `imported`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.comparePlayerData(existing, imported);

// comparePlayerDataの実用的な使用例
const result = instance.comparePlayerData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const field of criticalFields)
```

**パラメーター**:
- `const field of criticalFields`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const field of criticalFields);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (field in existing && field in imported)
```

**パラメーター**:
- `field in existing && field in imported`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(field in existing && field in imported);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (field === 'unlockedStages' || field === 'ownedItems')
```

**パラメーター**:
- `field === 'unlockedStages' || field === 'ownedItems'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(field === 'unlockedStages' || field === 'ownedItems');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existing[field] !== imported[field])
```

**パラメーター**:
- `existing[field] !== imported[field]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existing[field] !== imported[field]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ハイスコアの比較

**シグネチャ**:
```javascript
 if (existing.highScores && imported.highScores)
```

**パラメーター**:
- `existing.highScores && imported.highScores`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existing.highScores && imported.highScores);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (stage in existing.highScores)
```

**パラメーター**:
- `stage in existing.highScores`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(stage in existing.highScores);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existing.highScores[stage] !== imported.highScores[stage])
```

**パラメーター**:
- `existing.highScores[stage] !== imported.highScores[stage]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existing.highScores[stage] !== imported.highScores[stage]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareSettings

**シグネチャ**:
```javascript
 compareSettings(existing, imported)
```

**パラメーター**:
- `existing`
- `imported`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareSettings(existing, imported);

// compareSettingsの実用的な使用例
const result = instance.compareSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (key in existing && existing[key] !== value)
```

**パラメーター**:
- `key in existing && existing[key] !== value`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(key in existing && existing[key] !== value);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareStatistics

**シグネチャ**:
```javascript
 compareStatistics(existing, imported)
```

**パラメーター**:
- `existing`
- `imported`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareStatistics(existing, imported);

// compareStatisticsの実用的な使用例
const result = instance.compareStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const field of numericFields)
```

**パラメーター**:
- `const field of numericFields`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const field of numericFields);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (field in existing && field in imported)
```

**パラメーター**:
- `field in existing && field in imported`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(field in existing && field in imported);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existing[field] !== imported[field])
```

**パラメーター**:
- `existing[field] !== imported[field]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existing[field] !== imported[field]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### compareGeneric

**シグネチャ**:
```javascript
 compareGeneric(existing, imported)
```

**パラメーター**:
- `existing`
- `imported`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.compareGeneric(existing, imported);

// compareGenericの実用的な使用例
const result = instance.compareGeneric(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (existingStr !== importedStr)
```

**パラメーター**:
- `existingStr !== importedStr`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(existingStr !== importedStr);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### resolveConflicts

**シグネチャ**:
```javascript
async resolveConflicts(importData, conflicts, resolutionStrategy, options = {})
```

**パラメーター**:
- `importData`
- `conflicts`
- `resolutionStrategy`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resolveConflicts(importData, conflicts, resolutionStrategy, options = {});

// resolveConflictsの実用的な使用例
const result = instance.resolveConflicts(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!resolver)
```

**パラメーター**:
- `!resolver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!resolver);

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

#### executeImport

**シグネチャ**:
```javascript
async executeImport(resolvedData, options = {})
```

**パラメーター**:
- `resolvedData`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.executeImport(resolvedData, options = {});

// executeImportの実用的な使用例
const result = instance.executeImport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

データの最終検証

**シグネチャ**:
```javascript
 if (this.validation && this.config.validateBeforeImport)
```

**パラメーター**:
- `this.validation && this.config.validateBeforeImport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.validation && this.config.validateBeforeImport);

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

**シグネチャ**:
```javascript
 if (this.config.allowPartialImport)
```

**パラメーター**:
- `this.config.allowPartialImport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.allowPartialImport);

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
 if (this.config.allowPartialImport)
```

**パラメーター**:
- `this.config.allowPartialImport`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.allowPartialImport);

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

#### previewImport

**シグネチャ**:
```javascript
async previewImport(importData, conflictResolution = 'merge')
```

**パラメーター**:
- `importData`
- `conflictResolution = 'merge'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.previewImport(importData, conflictResolution = 'merge');

// previewImportの実用的な使用例
const result = instance.previewImport(/* 適切なパラメータ */);
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

#### generateImportWarnings

**シグネチャ**:
```javascript
 generateImportWarnings(importData, conflicts)
```

**パラメーター**:
- `importData`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateImportWarnings(importData, conflicts);

// generateImportWarningsの実用的な使用例
const result = instance.generateImportWarnings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

大量の競合がある場合

**シグネチャ**:
```javascript
 if (conflicts.length > 10)
```

**パラメーター**:
- `conflicts.length > 10`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(conflicts.length > 10);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (criticalConflicts.length > 0)
```

**パラメーター**:
- `criticalConflicts.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(criticalConflicts.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バージョンの不一致

**シグネチャ**:
```javascript
 if (importData.header && importData.header.gameVersion)
```

**パラメーター**:
- `importData.header && importData.header.gameVersion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importData.header && importData.header.gameVersion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importData.header.gameVersion !== currentVersion)
```

**パラメーター**:
- `importData.header.gameVersion !== currentVersion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importData.header.gameVersion !== currentVersion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### updateStatistics

**シグネチャ**:
```javascript
 updateStatistics(success, duration, partial)
```

**パラメーター**:
- `success`
- `duration`
- `partial`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStatistics(success, duration, partial);

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

#### if

**シグネチャ**:
```javascript
 if (partial)
```

**パラメーター**:
- `partial`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(partial);

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

#### getImportHistory

**シグネチャ**:
```javascript
 getImportHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getImportHistory();

// getImportHistoryの実用的な使用例
const result = instance.getImportHistory(/* 適切なパラメータ */);
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

## FormatValidator

### コンストラクタ

```javascript
new FormatValidator(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### validate

**シグネチャ**:
```javascript
async validate(importData)
```

**パラメーター**:
- `importData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(importData);

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

基本構造の確認

**シグネチャ**:
```javascript
 if (typeof importData !== 'object' || importData === null)
```

**パラメーター**:
- `typeof importData !== 'object' || importData === null`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof importData !== 'object' || importData === null);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

BubblePopSave形式の確認

**シグネチャ**:
```javascript
 if (importData.header)
```

**パラメーター**:
- `importData.header`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importData.header);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importData.header.format !== 'BubblePopSave')
```

**パラメーター**:
- `importData.header.format !== 'BubblePopSave'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importData.header.format !== 'BubblePopSave');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ユーザーデータの確認

**シグネチャ**:
```javascript
 if (!importData.userData && !importData.playerData)
```

**パラメーター**:
- `!importData.userData && !importData.playerData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!importData.userData && !importData.playerData);

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

## VersionValidator

### コンストラクタ

```javascript
new VersionValidator(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### validate

**シグネチャ**:
```javascript
async validate(importData)
```

**パラメーター**:
- `importData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(importData);

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importData.header && importData.header.gameVersion)
```

**パラメーター**:
- `importData.header && importData.header.gameVersion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importData.header && importData.header.gameVersion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

バージョン互換性のチェック

**シグネチャ**:
```javascript
 if (this.importManager.config.strictVersionCheck)
```

**パラメーター**:
- `this.importManager.config.strictVersionCheck`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.importManager.config.strictVersionCheck);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importVersion !== currentVersion)
```

**パラメーター**:
- `importVersion !== currentVersion`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importVersion !== currentVersion);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importMajor > currentMajor)
```

**パラメーター**:
- `importMajor > currentMajor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importMajor > currentMajor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (importMajor < currentMajor)
```

**パラメーター**:
- `importMajor < currentMajor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importMajor < currentMajor);

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

## IntegrityValidator

### コンストラクタ

```javascript
new IntegrityValidator(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### validate

**シグネチャ**:
```javascript
async validate(importData)
```

**パラメーター**:
- `importData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(importData);

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

チェックサムの検証（ある場合）

**シグネチャ**:
```javascript
 if (importData.metadata && importData.metadata.checksum)
```

**パラメーター**:
- `importData.metadata && importData.metadata.checksum`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(importData.metadata && importData.metadata.checksum);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.importManager.validation)
```

**パラメーター**:
- `this.importManager.validation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.importManager.validation);

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

## SizeValidator

### コンストラクタ

```javascript
new SizeValidator(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### validate

**シグネチャ**:
```javascript
async validate(importData)
```

**パラメーター**:
- `importData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.validate(importData);

// validateの実用的な使用例
const result = instance.validate(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataSize > this.importManager.config.maxImportSize)
```

**パラメーター**:
- `dataSize > this.importManager.config.maxImportSize`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataSize > this.importManager.config.maxImportSize);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataSize > 10 * 1024 * 1024)
```

**パラメーター**:
- `dataSize > 10 * 1024 * 1024`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataSize > 10 * 1024 * 1024);

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

## MergeResolver

### コンストラクタ

```javascript
new MergeResolver(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### resolve

**シグネチャ**:
```javascript
async resolve(importData, conflicts, options = {})
```

**パラメーター**:
- `importData`
- `conflicts`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resolve(importData, conflicts, options = {});

// resolveの実用的な使用例
const result = instance.resolve(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const conflict of conflicts)
```

**パラメーター**:
- `const conflict of conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const conflict of conflicts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (resolvedData.userData)
```

**パラメーター**:
- `resolvedData.userData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(resolvedData.userData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preview

**シグネチャ**:
```javascript
async preview(importData, conflicts)
```

**パラメーター**:
- `importData`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preview(importData, conflicts);

// previewの実用的な使用例
const result = instance.preview(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const conflict of conflicts)
```

**パラメーター**:
- `const conflict of conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const conflict of conflicts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const c of conflict.conflicts)
```

**パラメーター**:
- `const c of conflict.conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const c of conflict.conflicts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergeData

**シグネチャ**:
```javascript
async mergeData(dataType, existing, imported, conflicts)
```

**パラメーター**:
- `dataType`
- `existing`
- `imported`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergeData(dataType, existing, imported, conflicts);

// mergeDataの実用的な使用例
const result = instance.mergeData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (dataType)
```

**パラメーター**:
- `dataType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(dataType);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergePlayerData

**シグネチャ**:
```javascript
 mergePlayerData(existing, imported, conflicts)
```

**パラメーター**:
- `existing`
- `imported`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergePlayerData(existing, imported, conflicts);

// mergePlayerDataの実用的な使用例
const result = instance.mergePlayerData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ハイスコアは大きい方を採用

**シグネチャ**:
```javascript
 if (imported.highScores)
```

**パラメーター**:
- `imported.highScores`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(imported.highScores);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!merged.highScores[stage] || score > merged.highScores[stage])
```

**パラメーター**:
- `!merged.highScores[stage] || score > merged.highScores[stage]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!merged.highScores[stage] || score > merged.highScores[stage]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

配列は結合

**シグネチャ**:
```javascript
 if (imported.unlockedStages)
```

**パラメーター**:
- `imported.unlockedStages`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(imported.unlockedStages);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (imported.ownedItems)
```

**パラメーター**:
- `imported.ownedItems`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(imported.ownedItems);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergeSettings

**シグネチャ**:
```javascript
 mergeSettings(existing, imported, conflicts)
```

**パラメーター**:
- `existing`
- `imported`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergeSettings(existing, imported, conflicts);

// mergeSettingsの実用的な使用例
const result = instance.mergeSettings(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### mergeStatistics

**シグネチャ**:
```javascript
 mergeStatistics(existing, imported, conflicts)
```

**パラメーター**:
- `existing`
- `imported`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.mergeStatistics(existing, imported, conflicts);

// mergeStatisticsの実用的な使用例
const result = instance.mergeStatistics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const field of numericFields)
```

**パラメーター**:
- `const field of numericFields`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const field of numericFields);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (imported[field] > existing[field])
```

**パラメーター**:
- `imported[field] > existing[field]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(imported[field] > existing[field]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMergeAction

**シグネチャ**:
```javascript
 getMergeAction(conflict)
```

**パラメーター**:
- `conflict`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMergeAction(conflict);

// getMergeActionの実用的な使用例
const result = instance.getMergeAction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (conflict.type)
```

**パラメーター**:
- `conflict.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(conflict.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getMergeResult

**シグネチャ**:
```javascript
 getMergeResult(conflict)
```

**パラメーター**:
- `conflict`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getMergeResult(conflict);

// getMergeResultの実用的な使用例
const result = instance.getMergeResult(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (conflict.type)
```

**パラメーター**:
- `conflict.type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(conflict.type);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## OverwriteResolver

### コンストラクタ

```javascript
new OverwriteResolver(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### resolve

**シグネチャ**:
```javascript
async resolve(importData, conflicts, options = {})
```

**パラメーター**:
- `importData`
- `conflicts`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resolve(importData, conflicts, options = {});

// resolveの実用的な使用例
const result = instance.resolve(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preview

**シグネチャ**:
```javascript
async preview(importData, conflicts)
```

**パラメーター**:
- `importData`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preview(importData, conflicts);

// previewの実用的な使用例
const result = instance.preview(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## KeepResolver

### コンストラクタ

```javascript
new KeepResolver(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### resolve

**シグネチャ**:
```javascript
async resolve(importData, conflicts, options = {})
```

**パラメーター**:
- `importData`
- `conflicts`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resolve(importData, conflicts, options = {});

// resolveの実用的な使用例
const result = instance.resolve(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

競合があるデータは既存データを保持

**シグネチャ**:
```javascript
 for (const conflict of conflicts)
```

**パラメーター**:
- `const conflict of conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const conflict of conflicts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (resolvedData.userData)
```

**パラメーター**:
- `resolvedData.userData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(resolvedData.userData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preview

**シグネチャ**:
```javascript
async preview(importData, conflicts)
```

**パラメーター**:
- `importData`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preview(importData, conflicts);

// previewの実用的な使用例
const result = instance.preview(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## SelectiveResolver

### コンストラクタ

```javascript
new SelectiveResolver(importManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `importManager` | 説明なし |

### メソッド

#### resolve

**シグネチャ**:
```javascript
async resolve(importData, conflicts, options = {})
```

**パラメーター**:
- `importData`
- `conflicts`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.resolve(importData, conflicts, options = {});

// resolveの実用的な使用例
const result = instance.resolve(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const conflict of conflicts)
```

**パラメーター**:
- `const conflict of conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const conflict of conflicts);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (selection === 'import')
```

**パラメーター**:
- `selection === 'import'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(selection === 'import');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

インポートデータを使用

**シグネチャ**:
```javascript
 if (resolvedData.userData)
```

**パラメーター**:
- `resolvedData.userData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(resolvedData.userData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (selection === 'keep')
```

**パラメーター**:
- `selection === 'keep'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(selection === 'keep');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

既存データを保持

**シグネチャ**:
```javascript
 if (resolvedData.userData)
```

**パラメーター**:
- `resolvedData.userData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(resolvedData.userData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (resolvedData.userData)
```

**パラメーター**:
- `resolvedData.userData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(resolvedData.userData);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### preview

**シグネチャ**:
```javascript
async preview(importData, conflicts)
```

**パラメーター**:
- `importData`
- `conflicts`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.preview(importData, conflicts);

// previewの実用的な使用例
const result = instance.preview(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `validationResult` | 説明なし |
| `backupResult` | 説明なし |
| `conflicts` | 説明なし |
| `resolvedData` | 説明なし |
| `importResult` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `validationResults` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `result` | 説明なし |
| `conflicts` | 説明なし |
| `userData` | 説明なし |
| `existingData` | 説明なし |
| `dataConflicts` | 説明なし |
| `conflicts` | 説明なし |
| `conflicts` | 説明なし |
| `criticalFields` | 説明なし |
| `conflicts` | 説明なし |
| `conflicts` | 説明なし |
| `numericFields` | 説明なし |
| `conflicts` | 説明なし |
| `existingStr` | 説明なし |
| `importedStr` | 説明なし |
| `resolver` | 説明なし |
| `results` | 説明なし |
| `userData` | 説明なし |
| `validationResult` | 説明なし |
| `validationResult` | 説明なし |
| `conflicts` | 説明なし |
| `resolver` | 説明なし |
| `resolutionPreview` | 説明なし |
| `userData` | 説明なし |
| `dataTypes` | 説明なし |
| `dataSize` | 説明なし |
| `warnings` | 説明なし |
| `criticalConflicts` | 説明なし |
| `currentVersion` | 説明なし |
| `totalTime` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `currentVersion` | 説明なし |
| `importVersion` | 説明なし |
| `importMajor` | 説明なし |
| `currentMajor` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `userData` | 説明なし |
| `validationResult` | 説明なし |
| `errors` | 説明なし |
| `warnings` | 説明なし |
| `dataSize` | 説明なし |
| `userData` | 説明なし |
| `resolvedData` | 説明なし |
| `mergedData` | 説明なし |
| `actions` | 説明なし |
| `merged` | 説明なし |
| `merged` | 説明なし |
| `merged` | 説明なし |
| `numericFields` | 説明なし |
| `actions` | 説明なし |
| `userData` | 説明なし |
| `resolvedData` | 説明なし |
| `actions` | 説明なし |
| `selections` | 説明なし |
| `userData` | 説明なし |
| `resolvedData` | 説明なし |
| `selection` | 説明なし |
| `merged` | 説明なし |
| `actions` | 説明なし |

---

