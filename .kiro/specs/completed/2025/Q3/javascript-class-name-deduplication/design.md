# Design Document

## Overview

JavaScriptクラス名とファイル名の重複問題を解決するため、段階的なリファクタリングアプローチを採用します。分析により31個の重複ファイル名と63個の重複クラス名が特定されました。この設計では、自動化ツールと手動レビューを組み合わせて、安全で一貫性のある重複解決を実現します。

## Architecture

### Core Components

1. **DuplicationAnalyzer**: 重複の検出と分析
2. **NamingStrategyEngine**: 命名戦略の決定
3. **FileRenamer**: ファイルの安全なリネーム
4. **ClassRenamer**: クラス名の変更
5. **ImportUpdater**: import文の自動更新
6. **ValidationEngine**: 変更の検証
7. **ReportGenerator**: 変更レポートの生成

### Processing Pipeline

```
[Source Code] → [Analysis] → [Strategy] → [Rename] → [Update Imports] → [Validate] → [Report]
```

## Components and Interfaces

### DuplicationAnalyzer

```javascript
class DuplicationAnalyzer {
    analyzeFiles(sourceDir)
    findDuplicateFileNames()
    findDuplicateClassNames()
    identifyConflicts()
    generateConflictReport()
}
```

**責任:**
- ファイルシステムの走査
- クラス定義の抽出
- 重複の特定と分類
- 競合の優先度付け

### NamingStrategyEngine

```javascript
class NamingStrategyEngine {
    generateFileNameStrategy(duplicateFiles)
    generateClassNameStrategy(duplicateClasses)
    applyDomainPrefixes(conflicts)
    validateNamingConventions(newNames)
}
```

**命名戦略:**

1. **ディレクトリベースプレフィックス**
   - `src/debug/ErrorReporter.js` → `DebugErrorReporter.js`
   - `src/utils/error/ErrorReporter.js` → `UtilsErrorReporter.js`

2. **機能ベースプレフィックス**
   - `AudioAccessibilitySupport` → `CoreAudioAccessibilitySupport`, `ComponentAudioAccessibilitySupport`
   - `PerformanceMonitor` → `AnalyticsPerformanceMonitor`, `DebugPerformanceMonitor`

3. **階層ベース命名**
   - `src/core/help/ContentLoader.js` → `HelpContentLoader.js`
   - `src/core/help/components/ContentLoader.js` → `HelpComponentContentLoader.js`

### FileRenamer

```javascript
class FileRenamer {
    renameFile(oldPath, newPath)
    updateGitHistory(renames)
    createBackup(files)
    rollbackChanges(backupId)
}
```

**安全性機能:**
- Git履歴の保持
- 自動バックアップ
- ロールバック機能
- 段階的実行

### ClassRenamer

```javascript
class ClassRenamer {
    renameClassInFile(filePath, oldName, newName)
    updateExportStatements(changes)
    preserveJSDoc(classInfo)
    validateSyntax(modifiedContent)
}
```

### ImportUpdater

```javascript
class ImportUpdater {
    findAllImports(className, fileName)
    updateImportPaths(oldPath, newPath)
    updateNamedImports(oldName, newName)
    validateImportSyntax(updatedImports)
}
```

**更新パターン:**
- `import { ErrorReporter } from './debug/ErrorReporter.js'` → `import { DebugErrorReporter } from './debug/DebugErrorReporter.js'`
- 相対パスの自動調整
- 名前付きインポートの更新

## Data Models

### ConflictInfo

```javascript
class ConflictInfo {
    constructor(name, type, files, severity) {
        this.name = name;           // 重複している名前
        this.type = type;           // 'class' | 'file'
        this.files = files;         // 関連ファイルのリスト
        this.severity = severity;   // 'high' | 'medium' | 'low'
        this.strategy = null;       // 解決戦略
        this.newNames = [];         // 新しい名前のリスト
    }
}
```

### RenameOperation

```javascript
class RenameOperation {
    constructor(type, oldName, newName, filePath) {
        this.type = type;           // 'file' | 'class'
        this.oldName = oldName;
        this.newName = newName;
        this.filePath = filePath;
        this.dependencies = [];     // 依存する他の操作
        this.status = 'pending';    // 'pending' | 'completed' | 'failed'
    }
}
```

## Error Handling

### 段階的実行とロールバック

1. **Phase 1: Analysis and Planning**
   - エラー時: 分析結果の保存、手動レビューの推奨

2. **Phase 2: File Renaming**
   - エラー時: 部分的なロールバック、Git resetの実行

3. **Phase 3: Import Updates**
   - エラー時: 構文エラーの検出、自動修正の試行

4. **Phase 4: Validation**
   - エラー時: 詳細なエラーレポート、修正提案の生成

### エラー回復戦略

```javascript
class ErrorRecoveryStrategy {
    handleSyntaxError(file, error)      // 構文エラーの自動修正
    handleMissingImport(importPath)     // 欠落インポートの検出
    handleCircularDependency(cycle)     // 循環依存の解決
    generateFixSuggestions(errors)      // 修正提案の生成
}
```

## Testing Strategy

### Unit Tests

1. **DuplicationAnalyzer Tests**
   - ファイル走査の正確性
   - クラス抽出の完全性
   - 重複検出のロジック

2. **NamingStrategyEngine Tests**
   - 命名規則の一貫性
   - プレフィックス生成の正確性
   - 衝突回避の検証

3. **FileRenamer Tests**
   - ファイルリネームの安全性
   - バックアップ機能の動作
   - ロールバック機能の検証

### Integration Tests

1. **End-to-End Workflow**
   - 小規模なテストプロジェクトでの完全実行
   - 各段階での状態検証
   - エラー処理の動作確認

2. **Import Resolution Tests**
   - 複雑なインポート関係の処理
   - 相対パスの正確な更新
   - ES6モジュール構文の保持

### Manual Testing

1. **Code Review Process**
   - 重要なクラスの手動確認
   - 命名の妥当性レビュー
   - ビジネスロジックへの影響評価

2. **Build Verification**
   - 全テストスイートの実行
   - 本番ビルドの成功確認
   - 実行時エラーの検出

## Implementation Phases

### Phase 1: 分析と計画 (1-2 tasks)
- 重複の詳細分析
- 命名戦略の決定
- 変更計画の作成

### Phase 2: 低リスク重複の解決 (3-5 tasks)
- テストファイル内の重複
- 明確に分離可能な重複
- 依存関係の少ない重複

### Phase 3: 中リスク重複の解決 (6-10 tasks)
- コアシステムの重複
- 複数の依存関係を持つ重複
- インターフェース変更を伴う重複

### Phase 4: 高リスク重複の解決 (11-15 tasks)
- 基盤クラスの重複
- 広範囲に使用されるクラス
- アーキテクチャに影響する重複

### Phase 5: 検証と文書化 (16-18 tasks)
- 全体的な検証
- レポート生成
- 防止策の実装

## Performance Considerations

- **並列処理**: 独立したファイルの同時処理
- **メモリ効率**: 大きなファイルのストリーミング処理
- **キャッシュ**: AST解析結果のキャッシュ
- **増分処理**: 変更されたファイルのみの再処理

## Security Considerations

- **バックアップ**: 全変更前の完全バックアップ
- **権限**: ファイルシステム権限の適切な処理
- **検証**: 悪意のあるコード注入の防止
- **ログ**: 全操作の詳細ログ記録