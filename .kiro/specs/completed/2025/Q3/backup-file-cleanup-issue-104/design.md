# Design Document

## Overview

Issue #104で特定された5つの大容量バックアップファイルを安全に削除するためのシステムを設計します。これらのファイルは大容量ファイル分割プロジェクト（Issue #77, #103）の過程で作成されたバックアップファイルで、現在は使用されておらず、リポジトリサイズの削減とメンテナンス性向上のために削除する必要があります。

## Architecture

### Core Components

1. **BackupFileInvestigator**: 対象ファイルの詳細調査
2. **ReferenceAnalyzer**: ファイル参照関係の分析
3. **SafetyVerifier**: 削除安全性の検証
4. **SequentialFileRemover**: 段階的ファイル削除
5. **IntegrityValidator**: 削除後の整合性確認
6. **CleanupReporter**: 作業結果の詳細レポート

### Data Flow

```
BackupFileInvestigator → ReferenceAnalyzer → SafetyVerifier → SequentialFileRemover → IntegrityValidator → CleanupReporter
```

### Target Files Analysis

調査により以下の5つのファイルが削除対象として確認されました：

| ファイル | サイズ(語数) | 対応する現在ファイル | 作成経緯 |
|---------|-------------|-------------------|----------|
| `src/utils/TestConfigurationGenerator_old.js` | 3,288語 | `src/utils/TestConfigurationGenerator.js` | Task 4完了時のバックアップ |
| `src/utils/performance-monitoring/PerformanceDataAnalyzer_Original.js` | 2,871語 | `src/utils/performance-monitoring/PerformanceDataAnalyzer.js` | Task 2完了時のオリジナル保存 |
| `src/debug/TestDataGenerationCommands_old.js` | 2,621語 | `src/debug/TestDataGenerationCommands.js` | 分割プロジェクトでのバックアップ |
| `src/debug/TestDataGenerationCommands_backup.js` | 2,621語 | `src/debug/TestDataGenerationCommands.js` | 重複バックアップ |
| `src/seo/SEOTester_original.js` | 2,576語 | `src/seo/SEOTester.js` | 分割プロジェクトでのオリジナル保存 |

**合計削除予定サイズ**: 13,977語（推定55-70KB）

## Components and Interfaces

### BackupFileInvestigator

```javascript
class BackupFileInvestigator {
    async investigateTargetFiles(targetFiles)
    async checkCurrentFileExists(backupFilePath)
    async analyzeFileSize(filePath)
    async getGitHistory(filePath)
    async generateInvestigationReport(results)
}
```

**責任:**
- 対象ファイルの存在確認
- 対応する現在ファイルの存在確認
- ファイルサイズの分析
- Git履歴の調査
- 調査結果レポートの生成

### ReferenceAnalyzer

```javascript
class ReferenceAnalyzer {
    async searchImportReferences(filePath)
    async searchStringReferences(filePath)
    async excludeReportFiles(references)
    async analyzeReferenceContext(references)
    async generateReferenceReport(filePath, analysis)
}
```

**責任:**
- import文での参照検索
- 文字列での参照検索
- レポートファイル（file-size-report.json）の除外
- 参照コンテキストの分析
- 参照分析レポートの生成

### SafetyVerifier

```javascript
class SafetyVerifier {
    async verifyDeletionSafety(filePath)
    async checkCurrentFileIntegrity(currentFilePath)
    async validateNoActiveReferences(references)
    async checkBuildDependencies(filePath)
    async generateSafetyReport(verificationResults)
}
```

**責任:**
- 削除安全性の総合検証
- 現在ファイルの整合性確認
- アクティブな参照がないことの確認
- ビルド依存関係の確認
- 安全性レポートの生成

### SequentialFileRemover

```javascript
class SequentialFileRemover {
    async removeFilesSafely(verifiedFiles)
    async createDeletionBackup(filePath)
    async deleteFile(filePath)
    async verifyDeletion(filePath)
    async runPostDeletionTests()
}
```

**責任:**
- 段階的な安全なファイル削除
- 削除前のバックアップ記録作成
- ファイル削除の実行
- 削除の確認
- 削除後のテスト実行

### IntegrityValidator

```javascript
class IntegrityValidator {
    async validateBuildIntegrity()
    async runBasicTests()
    async checkImportResolution()
    async validateCoreFeatures()
    async generateIntegrityReport(validationResults)
}
```

**責任:**
- ビルド整合性の確認
- 基本テストの実行
- import解決の確認
- コア機能の検証
- 整合性レポートの生成

### CleanupReporter

```javascript
class CleanupReporter {
    async generateInvestigationSummary(investigationResults)
    async generateDeletionSummary(deletionResults)
    async calculateSizeReduction(beforeSizes, afterSizes)
    async createRecoveryInstructions(deletedFiles)
    async generateFinalReport(allResults)
}
```

**責任:**
- 調査結果サマリーの生成
- 削除結果サマリーの生成
- サイズ削減効果の計算
- 復旧手順の作成
- 最終レポートの生成

## Data Models

### TargetFileInfo

```javascript
{
    filePath: string,
    fileName: string,
    wordCount: number,
    sizeBytes: number,
    currentFilePath: string,
    currentFileExists: boolean,
    gitHistory: Array<{
        commit: string,
        date: string,
        message: string
    }>
}
```

### ReferenceAnalysis

```javascript
{
    filePath: string,
    importReferences: Array<{
        file: string,
        line: number,
        context: string
    }>,
    stringReferences: Array<{
        file: string,
        line: number,
        context: string,
        isReportFile: boolean
    }>,
    hasActiveReferences: boolean,
    safeToDelete: boolean
}
```

### SafetyVerification

```javascript
{
    filePath: string,
    currentFileIntact: boolean,
    noActiveReferences: boolean,
    buildDependenciesClean: boolean,
    overallSafety: boolean,
    warnings: Array<string>,
    recommendations: Array<string>
}
```

### DeletionResult

```javascript
{
    filePath: string,
    deleted: boolean,
    backupCreated: boolean,
    deletionTimestamp: Date,
    postDeletionTestsPassed: boolean,
    error: string | null
}
```

## Error Handling

### Error Categories

1. **File System Errors**: ファイル読み取り/削除エラー
2. **Reference Analysis Errors**: 参照分析中のエラー
3. **Build Verification Errors**: ビルド検証エラー
4. **Test Execution Errors**: テスト実行エラー

### Error Recovery Strategy

- **File System Errors**: リトライ機構とエラーログ
- **Reference Analysis Errors**: 手動確認を促すアラート
- **Build Verification Errors**: 削除プロセスの中止
- **Test Execution Errors**: 詳細なエラー情報の提供

### Rollback Mechanism

削除プロセス中にエラーが発生した場合：
1. 削除済みファイルのGit履歴からの復旧手順を提供
2. 削除前の状態に戻すためのコマンドを生成
3. 問題の詳細分析と修正提案を提供

## Testing Strategy

### Pre-Deletion Testing

- 対象ファイルの存在確認テスト
- 参照分析の正確性テスト
- 安全性検証ロジックのテスト

### Post-Deletion Testing

- ビルド成功の確認
- 基本機能テストの実行
- import解決の確認
- コア機能の動作確認

### Integration Testing

- 削除プロセス全体のエンドツーエンドテスト
- エラーハンドリングのテスト
- レポート生成の確認

## Implementation Notes

### Identified Files Status

現在の調査結果：

1. **TestConfigurationGenerator_old.js**: 
   - 現在ファイル存在確認済み
   - 参照なし（file-size-report.jsonのみ）
   - Git履歴: Task 4完了時のバックアップ

2. **PerformanceDataAnalyzer_Original.js**:
   - 現在ファイル存在確認済み
   - 参照なし（file-size-report.jsonのみ）
   - Git履歴: Task 2完了時のオリジナル保存

3. **TestDataGenerationCommands_old.js**:
   - 現在ファイル存在確認済み
   - 参照なし（file-size-report.jsonのみ）
   - 分割プロジェクトでのバックアップ

4. **TestDataGenerationCommands_backup.js**:
   - 現在ファイル存在確認済み
   - 参照なし（file-size-report.jsonのみ）
   - 上記ファイルの重複バックアップ

5. **SEOTester_original.js**:
   - 現在ファイル存在確認済み
   - 参照なし
   - 分割プロジェクトでのオリジナル保存

### Safety Considerations

- **段階的削除**: 1ファイルずつ削除し、各削除後に検証
- **バックアップ記録**: 削除前の状態を記録
- **復旧手順**: Git履歴を使用した復旧方法を文書化
- **テスト実行**: 各削除後の基本機能確認

## Security Considerations

- ファイル削除前の複数段階での安全性確認
- 削除操作の詳細ログ記録
- 復旧手順の事前準備
- 削除対象ファイルの厳格な検証

## Performance Impact

### Expected Benefits

- **リポジトリサイズ削減**: 約13,977語（55-70KB）
- **検索効率向上**: 不要ファイルが検索結果に含まれない
- **IDE性能向上**: インデックス対象ファイル数の削減
- **メンテナンス負荷軽減**: 不要ファイルの管理コスト削除