# Design Document

## Overview

不要な`_old`や`_original`がついたファイルを安全に削除するためのシステムを設計します。このシステムは、ファイルの特定、参照チェック、安全性確認、削除実行の各段階を経て、プロジェクトの整理を行います。

## Architecture

### Core Components

1. **FileScanner**: プロジェクト内の対象ファイルを特定
2. **ReferenceChecker**: ファイルが他の場所で参照されていないかを確認
3. **SafetyValidator**: 削除の安全性を検証
4. **FileRemover**: 実際のファイル削除を実行
5. **ReportGenerator**: 作業結果のレポートを生成

### Data Flow

```
FileScanner → ReferenceChecker → SafetyValidator → FileRemover → ReportGenerator
```

## Components and Interfaces

### FileScanner

```javascript
class FileScanner {
    scanForOldFiles(patterns = ['*_old*', '*_original*'])
    filterByFileType(files, extensions = ['.js'])
    validateFileExists(filePath)
}
```

**責任:**
- プロジェクト内の対象ファイルを検索
- ファイルタイプによるフィルタリング
- ファイル存在確認

### ReferenceChecker

```javascript
class ReferenceChecker {
    checkImportReferences(filePath)
    checkStringReferences(filePath)
    excludeTargetFile(searchResults, targetFile)
    generateReferenceReport(filePath, references)
}
```

**責任:**
- import文での参照チェック
- 文字列での参照チェック
- 対象ファイル自身を検索結果から除外
- 参照レポートの生成

### SafetyValidator

```javascript
class SafetyValidator {
    validateCurrentFileExists(oldFilePath)
    validateNoActiveReferences(references)
    validateFileSize(filePath)
    generateSafetyReport(filePath, validationResults)
}
```

**責任:**
- 対応する現在のファイルの存在確認
- アクティブな参照がないことの確認
- ファイルサイズの妥当性チェック
- 安全性レポートの生成

### FileRemover

```javascript
class FileRemover {
    createBackupRecord(filePath)
    removeFile(filePath)
    verifyRemoval(filePath)
    rollbackIfNeeded(backupRecord)
}
```

**責任:**
- バックアップレコードの作成
- ファイルの削除実行
- 削除の確認
- 必要に応じたロールバック

### ReportGenerator

```javascript
class ReportGenerator {
    generateScanReport(scannedFiles)
    generateReferenceReport(referenceResults)
    generateDeletionReport(deletionResults)
    generateSummaryReport(allResults)
}
```

**責任:**
- スキャン結果レポート
- 参照チェック結果レポート
- 削除結果レポート
- 総合サマリーレポート

## Data Models

### FileInfo

```javascript
{
    filePath: string,
    fileName: string,
    fileSize: number,
    lastModified: Date,
    fileType: string
}
```

### ReferenceResult

```javascript
{
    filePath: string,
    references: Array<{
        file: string,
        line: number,
        context: string,
        type: 'import' | 'string'
    }>,
    hasReferences: boolean
}
```

### ValidationResult

```javascript
{
    filePath: string,
    currentFileExists: boolean,
    hasActiveReferences: boolean,
    isSafeToDelete: boolean,
    warnings: Array<string>,
    errors: Array<string>
}
```

### DeletionResult

```javascript
{
    filePath: string,
    deleted: boolean,
    backupCreated: boolean,
    error: string | null,
    timestamp: Date
}
```

## Error Handling

### Error Categories

1. **File System Errors**: ファイル読み取り/削除エラー
2. **Reference Check Errors**: 参照チェック中のエラー
3. **Validation Errors**: 安全性検証エラー
4. **Backup Errors**: バックアップ作成エラー

### Error Recovery

- ファイルシステムエラー: リトライ機構
- 参照チェックエラー: 手動確認を促すログ出力
- 検証エラー: 削除をスキップして次のファイルへ
- バックアップエラー: 削除を中止

## Testing Strategy

### Unit Tests

- 各コンポーネントの個別機能テスト
- エラーハンドリングのテスト
- エッジケースのテスト

### Integration Tests

- コンポーネント間の連携テスト
- ファイルシステム操作のテスト
- レポート生成のテスト

### Safety Tests

- 誤削除防止のテスト
- バックアップ機能のテスト
- ロールバック機能のテスト

## Implementation Notes

### 特定されたファイル

現在のスキャンで特定された削除対象ファイル:

1. `src/core/AchievementManager_old.js` (80,507 bytes)
2. `src/utils/AdvancedRenderingOptimizer_old.js` (14,106 bytes)  
3. `src/scenes/MainMenuScene_original.js` (52,374 bytes)

### 対応する現在のファイル

- `src/core/AchievementManager.js` (11,507 bytes) - 存在確認済み
- `src/utils/AdvancedRenderingOptimizer.js` (21,013 bytes) - 存在確認済み
- `src/scenes/MainMenuScene.js` (14,292 bytes) - 存在確認済み

### 参照チェック結果

すべてのファイルについて、プロジェクト内での参照が存在しないことを確認済み。

## Security Considerations

- ファイル削除前の複数段階での安全性確認
- バックアップレコードによる削除履歴の保持
- 誤削除時のロールバック機能
- 削除対象ファイルの厳格な検証