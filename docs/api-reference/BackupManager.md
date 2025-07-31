# BackupManager

## 概要

ファイル: `core/BackupManager.js`  
最終更新: 2025/7/29 10:26:52

## 目次

## クラス
- [BackupManager](#backupmanager)
## 定数
- [startTime](#starttime)
- [backupData](#backupdata)
- [metadata](#metadata)
- [validationResult](#validationresult)
- [backupId](#backupid)
- [backupKey](#backupkey)
- [finalBackupData](#finalbackupdata)
- [endTime](#endtime)
- [duration](#duration)
- [result](#result)
- [backupData](#backupdata)
- [timestamp](#timestamp)
- [random](#random)
- [history](#history)
- [sortedHistory](#sortedhistory)
- [backupList](#backuplist)
- [backupData](#backupdata)
- [backupList](#backuplist)
- [now](#now)
- [toDelete](#todelete)
- [age](#age)
- [totalSize](#totalsize)
- [totalTime](#totaltime)
- [backupData](#backupdata)

---

## BackupManager

### コンストラクタ

```javascript
new BackupManager(dataStorage, validationManager = null)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `storage` | 説明なし |
| `validation` | 説明なし |
| `version` | 説明なし |
| `config` | バックアップ設定 |
| `backupQueue` | バックアップ管理 |
| `isBackupInProgress` | 説明なし |
| `autoBackupTimer` | 説明なし |
| `lastBackupTime` | 説明なし |
| `statistics` | バックアップ統計 |
| `isBackupInProgress` | 説明なし |
| `lastBackupTime` | 説明なし |
| `isBackupInProgress` | 説明なし |
| `backupHistory` | 説明なし |
| `backupHistory` | 説明なし |
| `backupHistory` | 説明なし |
| `backupHistory` | 説明なし |
| `backupHistory` | 説明なし |
| `autoBackupTimer` | 説明なし |
| `autoBackupTimer` | 説明なし |
| `config` | 説明なし |
| `backupQueue` | 説明なし |
| `isBackupInProgress` | 説明なし |

### メソッド

#### initialize

**シグネチャ**:
```javascript
async initialize()
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

#### createBackup

**シグネチャ**:
```javascript
async createBackup(dataType = 'all', options = {})
```

**パラメーター**:
- `dataType = 'all'`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createBackup(dataType = 'all', options = {});

// createBackupの実用的な使用例
const result = instance.createBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.isBackupInProgress && !options.force)
```

**パラメーター**:
- `this.isBackupInProgress && !options.force`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isBackupInProgress && !options.force);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

検証の実行

**シグネチャ**:
```javascript
 if (this.validation && options.validate !== false)
```

**パラメーター**:
- `this.validation && options.validate !== false`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.validation && options.validate !== false);

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

パフォーマンス要件チェック（< 500ms バックグラウンド）

**シグネチャ**:
```javascript
 if (duration > 500)
```

**パラメーター**:
- `duration > 500`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(duration > 500);

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

#### createAutoBackup

**シグネチャ**:
```javascript
async createAutoBackup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createAutoBackup();

// createAutoBackupの実用的な使用例
const result = instance.createAutoBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (result.success)
```

**パラメーター**:
- `result.success`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(result.success);

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

#### collectBackupData

**シグネチャ**:
```javascript
async collectBackupData(dataType)
```

**パラメーター**:
- `dataType`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.collectBackupData(dataType);

// collectBackupDataの実用的な使用例
const result = instance.collectBackupData(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataType === 'all' || dataType === 'playerData')
```

**パラメーター**:
- `dataType === 'all' || dataType === 'playerData'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataType === 'all' || dataType === 'playerData');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataType === 'all' || dataType === 'settings')
```

**パラメーター**:
- `dataType === 'all' || dataType === 'settings'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataType === 'all' || dataType === 'settings');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataType === 'all' || dataType === 'statistics')
```

**パラメーター**:
- `dataType === 'all' || dataType === 'statistics'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataType === 'all' || dataType === 'statistics');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (dataType === 'all' || dataType === 'achievements')
```

**パラメーター**:
- `dataType === 'all' || dataType === 'achievements'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(dataType === 'all' || dataType === 'achievements');

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

#### createBackupMetadata

**シグネチャ**:
```javascript
 createBackupMetadata(dataType, data, options = {})
```

**パラメーター**:
- `dataType`
- `data`
- `options = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.createBackupMetadata(dataType, data, options = {});

// createBackupMetadataの実用的な使用例
const result = instance.createBackupMetadata(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateBackupId

**シグネチャ**:
```javascript
 generateBackupId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateBackupId();

// generateBackupIdの実用的な使用例
const result = instance.generateBackupId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadBackupHistory

**シグネチャ**:
```javascript
async loadBackupHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadBackupHistory();

// loadBackupHistoryの実用的な使用例
const result = instance.loadBackupHistory(/* 適切なパラメータ */);
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

#### updateBackupHistory

**シグネチャ**:
```javascript
async updateBackupHistory(backupId, metadata)
```

**パラメーター**:
- `backupId`
- `metadata`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateBackupHistory(backupId, metadata);

// updateBackupHistoryの実用的な使用例
const result = instance.updateBackupHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.backupHistory)
```

**パラメーター**:
- `!this.backupHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.backupHistory);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴の制限（最大100件）

**シグネチャ**:
```javascript
 if (this.backupHistory.length > 100)
```

**パラメーター**:
- `this.backupHistory.length > 100`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.backupHistory.length > 100);

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

#### getBackupList

**シグネチャ**:
```javascript
async getBackupList()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBackupList();

// getBackupListの実用的な使用例
const result = instance.getBackupList(/* 適切なパラメータ */);
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

#### deleteBackup

**シグネチャ**:
```javascript
async deleteBackup(backupId)
```

**パラメーター**:
- `backupId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.deleteBackup(backupId);

// deleteBackupの実用的な使用例
const result = instance.deleteBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

履歴からの削除

**シグネチャ**:
```javascript
 if (this.backupHistory)
```

**パラメーター**:
- `this.backupHistory`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.backupHistory);

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

#### cleanupOldBackups

**シグネチャ**:
```javascript
async cleanupOldBackups()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.cleanupOldBackups();

// cleanupOldBackupsの実用的な使用例
const result = instance.cleanupOldBackups(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

保持数を超えている場合

**シグネチャ**:
```javascript
 if (index >= this.config.maxBackups)
```

**パラメーター**:
- `index >= this.config.maxBackups`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(index >= this.config.maxBackups);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (age > this.config.maxBackupAge)
```

**パラメーター**:
- `age > this.config.maxBackupAge`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(age > this.config.maxBackupAge);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

削除の実行

**シグネチャ**:
```javascript
 for (const backup of toDelete)
```

**パラメーター**:
- `const backup of toDelete`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const backup of toDelete);

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

#### startAutoBackup

**シグネチャ**:
```javascript
 startAutoBackup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.startAutoBackup();

// startAutoBackupの実用的な使用例
const result = instance.startAutoBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.autoBackupTimer)
```

**パラメーター**:
- `this.autoBackupTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoBackupTimer);

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

#### stopAutoBackup

**シグネチャ**:
```javascript
 stopAutoBackup()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.stopAutoBackup();

// stopAutoBackupの実用的な使用例
const result = instance.stopAutoBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.autoBackupTimer)
```

**パラメーター**:
- `this.autoBackupTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.autoBackupTimer);

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

#### if

自動バックアップ間隔の更新

**シグネチャ**:
```javascript
 if (newConfig.autoBackupInterval && this.autoBackupTimer)
```

**パラメーター**:
- `newConfig.autoBackupInterval && this.autoBackupTimer`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(newConfig.autoBackupInterval && this.autoBackupTimer);

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

#### updateStatistics

**シグネチャ**:
```javascript
 updateStatistics(success, duration, size, isAuto)
```

**パラメーター**:
- `success`
- `duration`
- `size`
- `isAuto`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.updateStatistics(success, duration, size, isAuto);

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
 if (isAuto)
```

**パラメーター**:
- `isAuto`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isAuto);

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

#### getStatus

**シグネチャ**:
```javascript
 getStatus()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getStatus();

// getStatusの実用的な使用例
const result = instance.getStatus(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getBackup

**シグネチャ**:
```javascript
async getBackup(backupId)
```

**パラメーター**:
- `backupId`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getBackup(backupId);

// getBackupの実用的な使用例
const result = instance.getBackup(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!backupData)
```

**パラメーター**:
- `!backupData`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!backupData);

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

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `backupData` | 説明なし |
| `metadata` | 説明なし |
| `validationResult` | 説明なし |
| `backupId` | 説明なし |
| `backupKey` | 説明なし |
| `finalBackupData` | 説明なし |
| `endTime` | 説明なし |
| `duration` | 説明なし |
| `result` | 説明なし |
| `backupData` | 説明なし |
| `timestamp` | 説明なし |
| `random` | 説明なし |
| `history` | 説明なし |
| `sortedHistory` | 説明なし |
| `backupList` | 説明なし |
| `backupData` | 説明なし |
| `backupList` | 説明なし |
| `now` | 説明なし |
| `toDelete` | 説明なし |
| `age` | 説明なし |
| `totalSize` | 説明なし |
| `totalTime` | 説明なし |
| `backupData` | 説明なし |

---

