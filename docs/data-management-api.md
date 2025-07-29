# データ管理強化 - API ドキュメント

## 概要

Bubble Pop Web Game のデータ管理強化システムの完全なAPI仕様書です。クラウド対応、オフライン機能、データ同期、バックアップ・復旧システムの全APIを網羅しています。

## 目次

1. [DataManager API](#datamanager-api)
2. [CloudStorageAdapter API](#cloudstorageadapter-api)
3. [SyncManager API](#syncmanager-api)
4. [OfflineManager API](#offlinemanager-api)
5. [BackupManager API](#backupmanager-api)
6. [RecoveryManager API](#recoverymanager-api)
7. [ExportManager API](#exportmanager-api)
8. [ImportManager API](#importmanager-api)
9. [SecurityManager API](#securitymanager-api)
10. [ValidationManager API](#validationmanager-api)
11. [使用例](#使用例)
12. [エラーハンドリング](#エラーハンドリング)

---

## DataManager API

### 概要
データ管理システムの中央制御クラス。全ての管理機能を統合し、統一されたインターフェースを提供します。

### コンストラクタ

```javascript
new DataManager(gameEngine)
```

**パラメータ:**
- `gameEngine` (Object): ゲームエンジンインスタンス

### メソッド

#### `initialize()`
データマネージャーを初期化します。

```javascript
async initialize()
```

**戻り値:** `Promise<void>`

**例:**
```javascript
const dataManager = new DataManager(gameEngine);
await dataManager.initialize();
```

#### `save(dataType, data, options)`
指定されたデータタイプでデータを保存します。

```javascript
async save(dataType, data, options = {})
```

**パラメータ:**
- `dataType` (string): データタイプ ('playerData', 'settings', 'statistics')
- `data` (Object): 保存するデータ
- `options` (Object): 保存オプション
  - `verify` (boolean): データ検証を実行するか (default: true)
  - `backup` (boolean): バックアップを作成するか (default: false)
  - `priority` (string): 優先度 ('high', 'medium', 'low')

**戻り値:** `Promise<boolean>`

**例:**
```javascript
await dataManager.save('playerData', {
    playerName: 'Player1',
    score: 15000,
    level: 5
}, { verify: true, backup: true });
```

#### `load(dataType, options)`
指定されたデータタイプでデータを読み込みます。

```javascript
async load(dataType, options = {})
```

**パラメータ:**
- `dataType` (string): データタイプ
- `options` (Object): 読み込みオプション
  - `useCache` (boolean): キャッシュを使用するか (default: true)
  - `validate` (boolean): データ検証を実行するか (default: true)

**戻り値:** `Promise<Object|null>`

**例:**
```javascript
const playerData = await dataManager.load('playerData');
console.log(playerData.playerName); // 'Player1'
```

#### `syncToCloud(options)`
クラウドとの同期を実行します。

```javascript
async syncToCloud(options = {})
```

**パラメータ:**
- `options` (Object): 同期オプション
  - `direction` (string): 同期方向 ('up', 'down', 'bidirectional')
  - `force` (boolean): 強制同期フラグ

**戻り値:** `Promise<SyncResult>`

**例:**
```javascript
const result = await dataManager.syncToCloud({
    direction: 'bidirectional'
});
console.log(`${result.synchronized} items synchronized`);
```

#### `authenticateCloud(credentials)`
クラウドストレージに認証します。

```javascript
async authenticateCloud(credentials)
```

**パラメータ:**
- `credentials` (Object): 認証情報
  - `username` (string): ユーザー名
  - `password` (string): パスワード

**戻り値:** `Promise<boolean>`

#### `getOfflineStatus()`
オフライン状態を取得します。

```javascript
getOfflineStatus()
```

**戻り値:** `OfflineStatus`

```typescript
interface OfflineStatus {
    isOnline: boolean;
    connectionQuality: 'good' | 'poor' | 'unstable' | 'offline';
    offlineOperations: number;
    cloudAvailable: boolean;
}
```

#### `getSyncStatus()`
同期状態を取得します。

```javascript
getSyncStatus()
```

**戻り値:** `SyncStatus`

```typescript
interface SyncStatus {
    isInProgress: boolean;
    lastSyncTime: number | null;
    pendingConflicts: number;
    cloudAuthenticated: boolean;
    isOnline: boolean;
}
```

---

## CloudStorageAdapter API

### 概要
クラウドストレージの抽象化インターフェース。複数のクラウドプロバイダーに対応可能です。

### コンストラクタ

```javascript
new CloudStorageAdapter(options = {})
```

**パラメータ:**
- `options` (Object): 設定オプション
  - `provider` (string): プロバイダー名 ('aws', 'gcp', 'azure', 'generic')
  - `apiEndpoint` (string): APIエンドポイントURL
  - `timeout` (number): タイムアウト時間 (ms)
  - `retryAttempts` (number): リトライ回数
  - `chunkSize` (number): チャンクサイズ (bytes)

### メソッド

#### `authenticate(credentials)`
クラウドサービスに認証します。

```javascript
async authenticate(credentials)
```

**パラメータ:**
- `credentials` (Object): 認証情報

**戻り値:** `Promise<boolean>`

#### `set(key, data)`
クラウドにデータを保存します。

```javascript
async set(key, data)
```

**パラメータ:**
- `key` (string): データキー
- `data` (Object): 保存データ

**戻り値:** `Promise<boolean>`

#### `get(key)`
クラウドからデータを取得します。

```javascript
async get(key)
```

**パラメータ:**
- `key` (string): データキー

**戻り値:** `Promise<Object|null>`

#### `remove(key)`
クラウドからデータを削除します。

```javascript
async remove(key)
```

**パラメータ:**
- `key` (string): データキー

**戻り値:** `Promise<boolean>`

#### `keys()`
全キーの一覧を取得します。

```javascript
async keys()
```

**戻り値:** `Promise<string[]>`

#### `getSize()`
使用ストレージサイズを取得します。

```javascript
async getSize()
```

**戻り値:** `Promise<number>` (bytes)

---

## SyncManager API

### 概要
ローカルとクラウド間のデータ同期を管理します。

### コンストラクタ

```javascript
new SyncManager(localStorage, cloudStorage)
```

### メソッド

#### `sync(options)`
データ同期を実行します。

```javascript
async sync(options = {})
```

**パラメータ:**
- `options` (Object): 同期オプション
  - `direction` (string): 同期方向
  - `force` (boolean): 強制同期

**戻り値:** `Promise<SyncResult>`

```typescript
interface SyncResult {
    direction: string;
    synchronized: number;
    conflicts: number;
    errors: number;
    skipped: number;
    details: SyncDetail[];
}
```

#### `startAutoSync()`
自動同期を開始します。

```javascript
startAutoSync()
```

#### `stopAutoSync()`
自動同期を停止します。

```javascript
stopAutoSync()
```

#### `updateConfig(newConfig)`
同期設定を更新します。

```javascript
updateConfig(newConfig)
```

**パラメータ:**
- `newConfig` (Object): 新しい設定

---

## OfflineManager API

### 概要
オフライン状態での操作とオンライン復帰時の処理を管理します。

### コンストラクタ

```javascript
new OfflineManager(dataStorage, syncManager)
```

### メソッド

#### `recordOfflineOperation(operation)`
オフライン操作を記録します。

```javascript
async recordOfflineOperation(operation)
```

**パラメータ:**
- `operation` (Object): 操作情報
  - `type` (string): 操作タイプ ('save', 'remove')
  - `key` (string): データキー
  - `data` (Object): データ (optional)

**戻り値:** `Promise<string>` (操作ID)

#### `processOfflineOperations()`
キューされたオフライン操作を処理します。

```javascript
async processOfflineOperations()
```

**戻り値:** `Promise<ProcessResult>`

#### `checkConnectionQuality()`
接続品質をチェックします。

```javascript
async checkConnectionQuality()
```

**戻り値:** `Promise<string>` ('good', 'poor', 'unstable', 'offline')

#### `getOfflineStatus()`
オフライン状態を取得します。

```javascript
getOfflineStatus()
```

**戻り値:** `OfflineStatus`

---

## BackupManager API

### 概要
データバックアップ機能を提供します。

### メソッド

#### `createBackup(manual)`
バックアップを作成します。

```javascript
async createBackup(manual = false)
```

**パラメータ:**
- `manual` (boolean): 手動バックアップかどうか

**戻り値:** `Promise<boolean>`

#### `getBackupList()`
バックアップ一覧を取得します。

```javascript
async getBackupList()
```

**戻り値:** `Promise<BackupInfo[]>`

```typescript
interface BackupInfo {
    id: string;
    timestamp: number;
    size: number;
    type: 'auto' | 'manual';
    dataTypes: string[];
}
```

#### `deleteBackup(backupId)`
指定されたバックアップを削除します。

```javascript
async deleteBackup(backupId)
```

**パラメータ:**
- `backupId` (string): バックアップID

**戻り値:** `Promise<boolean>`

---

## RecoveryManager API

### 概要
データ復旧機能を提供します。

### メソッド

#### `recoverData(dataType, strategy)`
データを復旧します。

```javascript
async recoverData(dataType, strategy = 'auto')
```

**パラメータ:**
- `dataType` (string): データタイプ
- `strategy` (string): 復旧戦略 ('auto', 'manual', 'factory')

**戻り値:** `Promise<RecoveryResult>`

```typescript
interface RecoveryResult {
    success: boolean;
    strategy: string;
    source: string;
    timestamp: number;
}
```

#### `checkDataIntegrity(dataType)`
データ整合性をチェックします。

```javascript
async checkDataIntegrity(dataType)
```

**パラメータ:**
- `dataType` (string): データタイプ

**戻り値:** `Promise<IntegrityResult>`

---

## ExportManager API

### 概要
データエクスポート機能を提供します。

### メソッド

#### `exportData(dataTypes, format)`
データをエクスポートします。

```javascript
async exportData(dataTypes, format = 'json')
```

**パラメータ:**
- `dataTypes` (string[]): エクスポートするデータタイプ
- `format` (string): エクスポート形式 ('json', 'encrypted', 'compressed')

**戻り値:** `Promise<ExportResult>`

```typescript
interface ExportResult {
    data: string | Object;
    format: string;
    size: number;
    checksum: string;
    timestamp: number;
}
```

---

## ImportManager API

### 概要
データインポート機能を提供します。

### メソッド

#### `importData(importData, conflictResolution)`
データをインポートします。

```javascript
async importData(importData, conflictResolution = 'ask')
```

**パラメータ:**
- `importData` (Object): インポートデータ
- `conflictResolution` (string): 競合解決方法 ('overwrite', 'merge', 'skip', 'ask')

**戻り値:** `Promise<ImportResult>`

```typescript
interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    conflicts: number;
    errors: string[];
}
```

#### `validateImportData(importData)`
インポートデータを検証します。

```javascript
async validateImportData(importData)
```

**パラメータ:**
- `importData` (Object): インポートデータ

**戻り値:** `Promise<ValidationResult>`

---

## SecurityManager API

### 概要
データセキュリティ機能を提供します。

### メソッド

#### `encryptData(data)`
データを暗号化します。

```javascript
async encryptData(data)
```

**パラメータ:**
- `data` (Object): 暗号化するデータ

**戻り値:** `Promise<EncryptedData>`

#### `decryptData(encryptedData)`
データを復号化します。

```javascript
async decryptData(encryptedData)
```

**パラメータ:**
- `encryptedData` (EncryptedData): 暗号化されたデータ

**戻り値:** `Promise<Object>`

#### `generateChecksum(data)`
データのチェックサムを生成します。

```javascript
generateChecksum(data)
```

**パラメータ:**
- `data` (Object): データ

**戻り値:** `string` (SHA-256ハッシュ)

---

## ValidationManager API

### 概要
データ検証機能を提供します。

### メソッド

#### `validateData(data, dataType)`
データを検証します。

```javascript
async validateData(data, dataType)
```

**パラメータ:**
- `data` (Object): 検証するデータ
- `dataType` (string): データタイプ

**戻り値:** `Promise<ValidationResult>`

```typescript
interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: string[];
}

interface ValidationError {
    field: string;
    message: string;
    code: string;
}
```

#### `addValidationRule(dataType, rule)`
カスタム検証ルールを追加します。

```javascript
addValidationRule(dataType, rule)
```

**パラメータ:**
- `dataType` (string): データタイプ
- `rule` (Function): 検証ルール関数

---

## 使用例

### 基本的なデータ管理

```javascript
// DataManagerの初期化
const dataManager = new DataManager(gameEngine);
await dataManager.initialize();

// プレイヤーデータの保存
await dataManager.save('playerData', {
    playerName: 'Player1',
    score: 15000,
    level: 5,
    achievements: ['first_game', 'score_10k']
});

// データの読み込み
const playerData = await dataManager.load('playerData');
console.log(`${playerData.playerName} - Level ${playerData.level}`);
```

### クラウド同期

```javascript
// クラウド認証
await dataManager.authenticateCloud({
    username: 'user@example.com',
    password: 'password123'
});

// データ同期
const syncResult = await dataManager.syncToCloud({
    direction: 'bidirectional'
});

console.log(`同期完了: ${syncResult.synchronized}件`);
```

### オフライン操作

```javascript
// オフライン状態の確認
const offlineStatus = dataManager.getOfflineStatus();
if (!offlineStatus.isOnline) {
    console.log('オフラインモードで動作中');
    console.log(`キューされた操作: ${offlineStatus.offlineOperations}件`);
}

// オンライン復帰時の自動同期
dataManager.on('onlineRecovery', (data) => {
    console.log(`オンライン復帰: ${data.offlineOperations}件の操作を同期`);
});
```

### バックアップと復旧

```javascript
// 手動バックアップの作成
await dataManager.backup.createBackup(true);

// バックアップ一覧の取得
const backups = await dataManager.backup.getBackupList();
console.log(`利用可能なバックアップ: ${backups.length}件`);

// データ復旧
const recoveryResult = await dataManager.recovery.recoverData('playerData', 'auto');
if (recoveryResult.success) {
    console.log(`データ復旧成功: ${recoveryResult.source}から復旧`);
}
```

### データエクスポート・インポート

```javascript
// データエクスポート
const exportResult = await dataManager.export.exportData(
    ['playerData', 'statistics'], 
    'json'
);

// ファイルとして保存
const blob = new Blob([JSON.stringify(exportResult.data)], {
    type: 'application/json'
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'bubble-pop-save.json';
a.click();

// データインポート
const fileInput = document.querySelector('#import-file');
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const text = await file.text();
    const importData = JSON.parse(text);
    
    const importResult = await dataManager.import.importData(importData, 'ask');
    console.log(`インポート完了: ${importResult.imported}件`);
});
```

---

## エラーハンドリング

### エラータイプ

#### データ管理エラー
- `DATA_MANAGER_INITIALIZATION_ERROR`: 初期化失敗
- `DATA_SAVE_ERROR`: データ保存失敗
- `DATA_LOAD_ERROR`: データ読み込み失敗

#### クラウドストレージエラー
- `CLOUD_STORAGE_INITIALIZATION_ERROR`: クラウド初期化失敗
- `CLOUD_AUTH_ERROR`: 認証失敗
- `CLOUD_STORAGE_SET_ERROR`: データ保存失敗
- `CLOUD_STORAGE_GET_ERROR`: データ取得失敗

#### 同期エラー
- `SYNC_ERROR`: 同期処理失敗
- `SYNC_CONFLICT_ERROR`: 同期競合エラー

#### オフラインエラー
- `OFFLINE_OPERATION_RECORD_ERROR`: オフライン操作記録失敗
- `OFFLINE_OPERATION_PROCESS_ERROR`: オフライン操作処理失敗

### エラーハンドリングの例

```javascript
try {
    await dataManager.save('playerData', playerData);
} catch (error) {
    if (error.code === 'DATA_SAVE_ERROR') {
        console.error('データ保存に失敗しました:', error.message);
        
        // フォールバック処理
        await dataManager.backup.createBackup(true);
        
        // ユーザーに通知
        showNotification('データ保存に失敗しました。バックアップを作成しました。');
    }
}

// イベントベースのエラーハンドリング
dataManager.on('error', (error) => {
    console.error('データ管理エラー:', error);
    
    switch (error.type) {
        case 'STORAGE_QUOTA_EXCEEDED':
            showDialog('ストレージ容量が不足しています。古いデータを削除してください。');
            break;
        case 'NETWORK_ERROR':
            showNotification('ネットワークエラーが発生しました。オフラインモードで継続します。');
            break;
        default:
            showNotification('予期しないエラーが発生しました。');
    }
});
```

### 復旧処理

```javascript
// データ破損検出時の自動復旧
dataManager.on('dataCorruption', async (event) => {
    console.warn(`データ破損検出: ${event.dataType}`);
    
    try {
        const recoveryResult = await dataManager.recovery.recoverData(
            event.dataType, 
            'auto'
        );
        
        if (recoveryResult.success) {
            console.log('自動復旧に成功しました');
            showNotification('データが自動復旧されました');
        } else {
            // 手動復旧オプションを提示
            showRecoveryDialog(event.dataType);
        }
    } catch (recoveryError) {
        console.error('復旧処理に失敗:', recoveryError);
        showErrorDialog('データ復旧に失敗しました。サポートにお問い合わせください。');
    }
});
```

---

## パフォーマンス考慮事項

### 推奨設定値

```javascript
const performanceConfig = {
    // データ保存
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    autoSaveInterval: 30000, // 30秒
    
    // クラウド同期
    syncBatchSize: 10,
    autoSyncInterval: 5 * 60 * 1000, // 5分
    maxRetries: 3,
    
    // オフライン管理
    maxOfflineOperations: 1000,
    heartbeatInterval: 30000, // 30秒
    
    // バックアップ
    maxBackups: 10,
    autoBackupInterval: 24 * 60 * 60 * 1000 // 24時間
};
```

### パフォーマンス監視

```javascript
// パフォーマンス監視の有効化
dataManager.enablePerformanceMonitoring(true);

// パフォーマンスメトリクスの取得
const metrics = dataManager.getPerformanceMetrics();
console.log('平均保存時間:', metrics.avgSaveTime);
console.log('平均読み込み時間:', metrics.avgLoadTime);
console.log('メモリ使用量:', metrics.memoryUsage);
```

このAPIドキュメントは、データ管理強化システムの全機能を網羅しており、開発者が効率的にシステムを活用できるように設計されています。